// [עברית] קומפוננטה חדשה וייעודית זו אחראית אך ורק על ממשק עריכת נתוני תלוש במצב ניהול.
// היא מבודדת לחלוטין, ומאפשרת עריכה אינטראקטיבית של כל שדה, הפקת JSON, וחזרה למסך הראשי.

import React, { useState, useEffect, useRef } from 'react';
import type { PayslipData, PayslipSession } from '../types';

interface AdminEditorProps {
  initialData: PayslipData;
  uploadedImage: string;
  onExit: () => void;
}

// [עברית] קומפוננטת עזר פנימית לעריכת שדה טקסט.
const EditableField: React.FC<{ initialValue: string; onSave: (newValue: string) => void; className?: string; isNumeric?: boolean; isTextArea?: boolean; }> = 
({ initialValue, onSave, className, isNumeric = false, isTextArea = false }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef<HTMLInputElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    useEffect(() => {
        if (isEditing) {
            if (isTextArea && textAreaRef.current) {
                textAreaRef.current.focus();
                textAreaRef.current.select();
            } else if (inputRef.current) {
                inputRef.current.focus();
                inputRef.current.select();
            }
        }
    }, [isEditing, isTextArea]);
    
    const handleSave = () => {
        setIsEditing(false);
        if (value !== initialValue) {
            onSave(value);
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        }
        if (e.key === 'Escape') {
            setIsEditing(false);
            setValue(initialValue);
        }
    };
    
    if (isEditing) {
        if (isTextArea) {
            return (
                <textarea
                    ref={textAreaRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={handleKeyDown}
                    className={`text-inherit w-full bg-gray-700 rounded p-1 ring-2 ring-red-500 ${className}`}
                    rows={4}
                />
            );
        }
        return (
            <input
                ref={inputRef}
                type={isNumeric ? "number" : "text"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className={`text-inherit bg-gray-700 rounded p-1 ring-2 ring-red-500 ${className}`}
            />
        );
    }

    return (
        <span onDoubleClick={() => setIsEditing(true)} className={`cursor-pointer p-1 -m-1 rounded-md hover:bg-gray-700 w-full inline-block ${className}`}>
            {value || '(לחץ פעמיים לעריכה)'}
        </span>
    );
};

// [עברית] קומפוננטת עזר פנימית לכרטיס מידע שניתן לעריכה.
const EditableInfoCard: React.FC<{ title: string; value: number; className?: string; onSave: (newValue: number) => void; }> = 
({ title, value, className, onSave }) => (
    <div className={`p-4 rounded-lg shadow-inner ${className}`}>
      <p className="text-sm text-gray-400">{title}</p>
      <div className="text-2xl font-bold">
        <EditableField 
            initialValue={value.toString()} 
            onSave={(val) => onSave(Number(val) || 0)} 
            isNumeric={true}
            className="w-full bg-transparent p-0 border-none focus:ring-0"
        />
      </div>
    </div>
);

const AdminEditor: React.FC<AdminEditorProps> = ({ initialData, uploadedImage, onExit }) => {
    const [data, setData] = useState<PayslipData>(initialData);
    const [generatedJson, setGeneratedJson] = useState<string | null>(null);

    // [עברית] פונקציה גנרית לעדכון שדות מקוננים באובייקט הנתונים.
    const handleDataUpdate = (updateFn: (draft: PayslipData) => void) => {
        const newData = JSON.parse(JSON.stringify(data)); // Deep copy
        updateFn(newData);
        setData(newData);
    };

    const handleGenerateJson = () => {
        const sessionToExport: Omit<PayslipSession, 'id'> & { id?: number } = {
            title: `תלוש הדגמה - ${data.payPeriod}`,
            uploadedImage: uploadedImage,
            payslipData: data,
            chatMessages: [{ 
                sender: 'bot', 
                text: `סיימתי לנתח את התלוש. הנתונים מוצגים לצד הצ'אט.\n\nעכשיו אפשר לשאול אותי כל שאלה, או ללחוץ על כל סעיף ברשימה לקבלת הסבר.`
            }]
        };
        // [עברית] הוספת הערה בראש ה-JSON כדי להזכיר למשתמש להוסיף ID.
        const jsonString = `// Please add an 'id' property here (e.g., "id": 1,)\n${JSON.stringify(sessionToExport, null, 2)}`;
        setGeneratedJson(jsonString);
    };

    const copyToClipboard = () => {
        if (generatedJson) {
            navigator.clipboard.writeText(generatedJson).then(() => {
                alert('הטקסט הועתק ללוח!');
            }, (err) => {
                alert('שגיאה בהעתקה: ' + err);
            });
        }
    };
    
    return (
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 w-full flex flex-col flex-grow">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2 border-gray-600 text-gray-100 flex-shrink-0">
                שלב 3: עריכת נתונים וייצוא
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6 flex-grow min-h-0">
                <div className="w-full p-2 border-2 border-dashed rounded-lg border-gray-600 overflow-y-auto">
                    <img src={uploadedImage} alt="תלוש לעריכה" className="w-full h-auto rounded-md" />
                </div>
                <div className="flex flex-col min-h-0">
                    <div className="flex-grow overflow-y-auto pr-2 -mr-2 space-y-6 text-gray-200">
                        {/* [עברית] ממשק העריכה */}
                        <div className="text-center">
                            <h3 className="text-xl font-semibold">
                               <EditableField initialValue={data.employerName} onSave={val => handleDataUpdate(d => d.employerName = val)} />
                            </h3>
                            <p className="text-md text-gray-400">
                                תלוש שכר עבור <EditableField initialValue={data.employeeName} onSave={val => handleDataUpdate(d => d.employeeName = val)} /> 
                                (<EditableField initialValue={data.employeeId} onSave={val => handleDataUpdate(d => d.employeeId = val)} />)
                            </p>
                             <p className="text-md text-gray-400">
                                תקופה: <EditableField initialValue={data.payPeriod} onSave={val => handleDataUpdate(d => d.payPeriod = val)} />
                            </p>
                        </div>
                        <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-700">
                            <h4 className="font-semibold text-lg mb-2 text-gray-200">סיכום ממבט על</h4>
                            <div className="text-gray-300">
                                <EditableField isTextArea initialValue={data.summary} onSave={val => handleDataUpdate(d => d.summary = val)} className="w-full" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <EditableInfoCard title="שכר ברוטו" value={data.grossSalary} className="bg-gray-700 text-gray-200" onSave={val => handleDataUpdate(d => d.grossSalary = val)} />
                            <EditableInfoCard title="סך ניכויים" value={data.totalDeductions} className="bg-red-900/50 text-red-200" onSave={val => handleDataUpdate(d => d.totalDeductions = val)} />
                            <EditableInfoCard title="שכר נטו" value={data.netSalary} className="bg-green-900/50 text-green-200" onSave={val => handleDataUpdate(d => d.netSalary = val)} />
                        </div>
                        <div className="space-y-4">
                            {data.categories.map((category, catIndex) => (
                              <div key={catIndex} className="p-4 bg-gray-700/50 rounded-lg">
                                <h4 className="font-semibold text-lg mb-2">
                                    <EditableField initialValue={category.categoryTitle} onSave={val => handleDataUpdate(d => d.categories[catIndex].categoryTitle = val)} /> 
                                </h4>
                                <div className="space-y-2 text-sm">
                                  {category.items.map((item, itemIndex) => (
                                    <div key={itemIndex} className="flex justify-between items-center gap-2 p-1 -m-1 rounded-md">
                                       <span className="w-2/3"><EditableField initialValue={item.description} onSave={val => handleDataUpdate(d => d.categories[catIndex].items[itemIndex].description = val)} /></span>
                                       <span className="font-mono font-semibold w-1/3 text-left"><EditableField initialValue={item.value} onSave={val => handleDataUpdate(d => d.categories[catIndex].items[itemIndex].value = val)} /></span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-600 flex flex-col items-center gap-4 flex-shrink-0">
                <button
                    onClick={handleGenerateJson}
                    className="w-full sm:w-2/3 px-8 py-3 bg-red-700 text-white font-bold text-lg rounded-lg shadow-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 transition-transform transform hover:scale-105"
                >
                    הפק והעתק JSON
                </button>
                <button
                    onClick={onExit}
                    className="w-full sm:w-2/3 px-6 py-2 bg-gray-600 text-gray-200 font-semibold rounded-lg shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                    צא ממצב ניהול
                </button>
            </div>

            {generatedJson && (
               <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={() => setGeneratedJson(null)}>
                <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-3xl h-[90vh] max-h-[800px] flex flex-col p-6 sm:p-8" onClick={e => e.stopPropagation()}>
                    <h2 className="text-2xl font-bold mb-4 text-gray-100">נתוני הדגמה (JSON)</h2>
                    <div className="p-4 bg-red-900/30 rounded-lg border border-red-800 mb-4 text-red-200">
                        <h3 className="font-bold">הוראות:</h3>
                        <ol className="list-decimal list-inside mt-2 space-y-1">
                            <li>לחץ על כפתור "העתק ללוח" למטה.</li>
                            <li>פתח את הקובץ <code className="font-mono bg-gray-700 px-1 rounded">services/demoData.ts</code> בקוד המקור.</li>
                            <li>הדבק את כל הטקסט שהועתק לתוך המערך הריק של <code className="font-mono bg-gray-700 px-1 rounded">DEMO_SESSIONS</code>.</li>
                            <li>זכור להוסיף מספר מזהה ייחודי (למשל: <code className="font-mono bg-gray-700 px-1 rounded">"id": 1,</code>) בתחילת האובייקט שהדבקת.</li>
                        </ol>
                    </div>
                    <textarea
                        readOnly
                        value={generatedJson}
                        className="flex-grow w-full p-4 font-mono text-sm bg-gray-900 text-gray-200 border border-gray-700 rounded-lg resize-none"
                        onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                    />
                    <div className="mt-4 flex gap-4">
                        <button onClick={copyToClipboard} className="flex-grow px-8 py-3 bg-red-700 text-white font-bold rounded-lg shadow-md hover:bg-red-800">העתק ללוח</button>
                        <button onClick={() => setGeneratedJson(null)} className="px-6 py-3 bg-gray-600 text-gray-200 font-semibold rounded-lg shadow-sm hover:bg-gray-700">סגור</button>
                    </div>
                </div>
            </div>
          )}
        </div>
    );
};

export default AdminEditor;
