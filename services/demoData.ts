// [עברית] קובץ זה מכיל נתונים מוכנים מראש עבור תלושי הדגמה.
// הנתונים כאן יוחלפו בנתונים האמיתיים שיופקו ממצב הניהול.
// ברגע שיהיו כאן נתונים, לחיצה על "טען תלושי הדגמה" תטען אותם לאפליקציה.

import type { PayslipSession } from '../types';

export const DEMO_SESSIONS: PayslipSession[] = [
  // [עברית] כאן המקום להדביק את אובייקטי התלושים המוכנים ממצב הניהול.
  // [עברית] נא לוודא שלכל אובייקט יש 'id' ייחודי.
  {
  "id": 1,
  "title": "תלוש הדגמה - פברואר 2011",
  "uploadedImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABK4AAAXqCAYAAADZJCKxAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAHYcAAB2HAY/l8WUAAP+lSURBVHhe7P1nkyTZeaCJPqG1ytCRGRGpM0tkia5qAaCBBkmQe22uzYzZ7qy4a2v7YffaXrP9AfN5fwQ5d23BO0MSvHdIgiAJDgnR3UB3ya7q0iKrKrNS64jI0Fr6/eCiPL0iqwoNoJsA/DELy/Tjx18/fvz4Ee95z3sM165/JqCjo6Ojo6Ojo6Ojo6Ojo6Ojo/MvDMN3v/tdQRAE+v0+ACaTCUGAgQAwAKGP0WjCZDIzGPQZDAYYDAbAoJWlo6Oj8xuDwWDAYDCgrv+MRqNUv8FgMGAwGGAyGjEbjQiAIIAgCAiCAAaDXg3qvDFyuZLLmtlsxmCAbrfLQBAwm6xgAGHQBQwYjUZALJ86Ojo6Ojo6Ojo6v0vIfWe5L2z44Q//QTCbLUqA0WgUB2diNBAG0mDOKA3YBoA44NPR0dH5TUZWXA0GA+VYrtva7TaNRgOzyYTNYkEQoC8IWCwWLGazqLTS60GdXwBF6SlNEgH0+z0EAYxGE71ej0azjsloxOFwKnF0dHR0dHR0dHR0ftfodDqUy2VarRaGZ8+eCX6/X5rdFTvWLyyqhs/06korHR2d33S0liyyUkFWXhUKBTKZDFaLBbfLzWAwoNfv4fP58fm8Yh2pV4U6b4isHGVIGyqXxWq1SiaTwWazEo3GsNlsL8XV0dHR0dHR0dHR+W1HEARKpRJPnjwhm81iyGQyQigUOrI8xmCQlym8uEhG70Tr6Oj8tqCYnkqWV+rjbDbD5uYWNqsVr9dLt9uj0+0QDoUJhoIYjcYj9aSOzqvQKkaHlbBisYjW1hYOh4NUKoXD4dDbXB0dHR0dHR0dnd9JDg8PuXXrFjs7OxjlTrTceR4MBi9ZIsjnGWKloKOjo/Obirpuk/+X/VwJku+rXr9Ht9ej3WnTrDdotVp0Oh0G/RcWNDo6b4K6vGnDZSXoYNBjMOiLLtSGxNXR0dHR0dHR0dH5XUIQBBRzAVlhdVzHWkdHR+e3FbU1zItj2RpGdKjd7/Xp9fv0+30G/T4DQVdc6bwZ6gkfuaxpj+XyZzSaFMfsOjo6Ojo6Ojo6OjqIiqvBYEC/30cQBEwmudMsoltY6ejo/DYjqCxN1T+kzSqQdoIbCAMEpPMDZQcLHZ1Xoi5PwyyX5d0rZcWVyWTGaBSdsuvtr46Ojo6Ojo6Ojo6kuJKXKai3gld3ttX/6+jo6Py2Idd7w6xNBUFUUhkAo8GIUVlerY2pozMcrSWzfKz9gaxEfbHLpY6Ojo6Ojo6Ojs7vOkZZaaW2tBo2Q6zeLl5HR0fntwW5DpTrP7WSYTAYgCBgAAwGIyYpntFoRNdc6bwJxymtZNSTRoIg0O936ff7ynkdHR0dHR0dHR2d33WO3RJLq6CSj3XLKx0dnd9WtEp78Scpq1R14LBNLHR0XsWbWC4Lgjreq+Pq6Ojo6Ojo6Ojo/LYj94uN2s6xdtAmI88Gv0nnW0dHR+c3AXV9pq7fXiitXl5GrfgEHOj1oM4vxrDypqOjo6Ojo6Ojo6NzFPVkriAIGOUZXhm1ZZW2Y60ezOno6Oj8NqGu39T1niAI9NW7rhqNGE0vFFk6Om/KsPZT3dYaDAbMJjMmo0mxvtLR0dHR0dHR0dH5XUM9NjMYDMcvFdQuhdGVVjo6Or/tqOs4uf4TEOgP+gykY6NRVF4ZjHpdqPPmHNd+qieIDAYDJqO0q6BukaWjo6Ojo6Ojo/M7j+S6RT7UWlipncUeF0dHR0fntw3Z8kX+H6k+ZIhCX0fnl0WrLB0IUhk7RtGlo6Ojo6Ojo6Oj87uDgCAMxF0Fh3WOh4UJklNiHR2dX4x+v0+3K+4Wpis/Xo9c1/T7fXq9nuhT6teQZ9r677h76IornV8X2jLYHwwQeOFnTUdHR0dHR0dHR+d3FdlwSrG4kjvJ6s7ysGN5AKfzyzPMek0Oe9U57bE23nFo472pLEFSImiVlnK49hq1rONkMuR51OHq/4fdQ8txstRoZWmPj0P7HMPupY4z7Nz+/j4PHz5kfX2dw8NDms3m0Lgyx50blo5h8dS8SZw35YvIEobk83Fpl4+73S7ZbJa1tTVWVlbY2dmh1Wq9FHeYDPncq971sOsElVP2l84NBAyKQt8g7mkx5L46Om+KVjGlbmd1fjcYVif+Igy7Rg7T1rna88M47pw27HXHMsfJG4Yc903j/zIMu8dx91ana9h5HR0dHR2d1/Gb2n78Mu3fcddpw97sHmKf+bVaKG3HWtvZ1nlzBoMBnU6HVqtFs9mk3W7T6XRot9u0Wi263a4SV5A6nt1ul2q1Sj6fJ5fLkctlKZWK1Ot1er2e8pLlv4PBgF6vR6vVolqt0mw26ff7tFotyuUy+XyebDbL4eEhpVKJVquldHDlX6/Xo9ls0mg0aLfbtNtt5X+t5Yv2OvnZGo0GvV7vSDw1g8GAdrt95D5qxZj2Hm/CsEJ/XNiw/4ehfj7tsTpMizasUCiwvr7Gzs4OuVyORqNx7PVa+dpwbdiboo07TN6b8CbXaeNoj4ehPt/r9SiXyxwcHLCxscHe3t4RxZVWnlb2q85r4x4XpiCArKQyGAzotZ/Orwu9bf3dQ1s3ycfD6jDtsfZ/OY42rjae9v83QRtffc9hvO5e6jRq0zssPsfEe9XxL4r2+uPSp6Ojo6Oj85uItj3THqs5Llzmddcedw5N+/omyIYDhlwuJ4RCIe15nV8DlUqF/f19arUa/X4fq9WKw+Gg0+kwGAyIxaIy8FIulykUCty7d48nT55QrVYAmJiYZHZ2hlOnThGNxo5YiDSbTSqVCru7u6yvrxGPxzl58hRra6s8ePCAvb19stkMwWCQSCTK22+/zalTp7BYLBiNRrrdLuVymbW1NRqNOiMjQYxGI9VqFbfbTTKZxO12YzKZFCWmXDj39/fZ29uj0+kwGAyYnJxkbGwMNAXTYDBQrVbZ3t6iVCrT6/UZGRlhYnICl9OpxJevOW4wJwyxkNHGfdMPQka+Xv1BacPkY+29jkMQBHZ2ttnd3aVaFd/9/Pw8qVTqtTLU+Ssfq8O1GAwGRRGp9VOnlaG+Rr6HnJ8yw8LVeaKOx5D8e5VsmWHXdjodyuUy+/v7PH/+HLvdxsWLbxOJRF6SMSwv1DK1eSBIeSOf18aXjzOZDJubm5iMJpwOB91ul3a7TSQSIRQOY7NZsVit0h11dH55isUiGxsbOBwO0uk0DodDGwU09Zr2e9D5zUFbb6l507pKHf9V548LU6O9Vi1Tfa26TtXKfF06tMcy6vjHlW+tTO2xHKYNf1V8Ner7HhdXe6yjo6Ojo3Mcx7UlXzZy2zgsHdo29LhzWrRt9XHt/3FtsPpYe04+bzAYODw85NatW2xvb2P69//+3/8fTklZoPPrQxAE8vk8T548YX9/n1arpfg7yuVybGysY7PZiESiisIhm82ysbHBvXt3uXPnDsvLy6yvr1OtVhgMBkSjUQKBEQyqJZzVapW9vV2eP3/O4uJjBgOBQCDAysoK9+7dY3FxkYcPH3BwkOHwMEcgMEIkEsFisWAymajVahwcHPD06VMymQMsFgvtdodMJkOr1cJsNmM0GrHZbBiNRoxGI71ej06nw9raGouLi2QyGfL5PMFgkGg0CppC2uv1KBYLPHv2lLX1dTKZLAajkVg09tJAzXCMlZ+2gMt+kNT3GQxZ3iijlivHVR8z5OPVKoTkMNkKbVg6UT7IAUajkVKpSKFQJBIJMzISlK4B0enci/jDZAmv0F7L92eIHyZ1nqiP5biy5Z5BUnrJlnJGo1G55zB5MvJ5+VptXqrfg1qmjJyH6mc2GAxYLBY6nQ7b29v0+33GxsbweDzKefVfdTrVeaH9K59Xv0M16rB6vU65XMZoMGKxWJR0ulwunC4XZrMJk8l05HodnV+GVqtFqVTCYrHg9/uxWCzaKApyOR9WjtX0+33FarZSqVCtVqnVarTbbeU7VH8PnU6HZrNJtVqlUqlQq9Wo1+v0+32QvhG5vfmismu1KuWyLltG+y61daRBNSEhH2uvH3adjBxXXRer7yWHy3INqrpbmw75rzatx91bjTbdarQy1ek5jsGgz2Ag5wmg2MMKDAYCg0EfQThar4txh8scFq7Ok2HndXR0dHR03oSvsg1R9x9QjRWPa9vU/QqU68Sxqjq6LONoX+Jo2ynHU99PHlOh6ROp48vHjUaDvb09KpWKrrj6MpBf1vb2NleuXKHdbnPmzBnGx8cJBoOSEucZdruDUCiE0WjEbDazvLzM06dPSSZTfO1rX+f06dOk02nK5TKHh4d4vV4cDgcOhwObzQZAJnPAgwcPKZfL+HziwKdQyGO32zl58iSnTp3irbcu4HA4qFYrmM0mWq0WHo8Hp9PJ6uoqGxsbtFot/H4fU1NTRCIRHA4HzWaD5eUl2u0W0WhMuWe9XqdQKPD8+XOePn1Ct9vFbDYzNjamKK5ker2eYhH29OkzspkM/f4Av99PMjmGw+F46SNSF2b1Ofn/fr9PpVKhXq8rhV+2jpGXIJrNZgTJkgdQLMbkNHW7XQwGwxFFhPa8rOBRf2DdblcZwIhKPfmDU8RgMECvJ3awu90ORqORWCyKz+d7EUmKN+y55f/7kqNy9ccsD5bkuIIg0JcUovJfdb7JaZfjN5tNCoUCvV4Pm82mHBsMBmw2mxL...",
  "payslipData": {
    "employeeName": "ישראל ישראלי",
    "employeeId": "033333333",
    "employerName": "Company LTD",
    "payPeriod": "פברואר 2011",
    "grossSalary": 7500,
    "netSalary": 6687,
    "totalDeductions": 813,
    "summary": "תלוש שכר לחודש פברואר 2011 עבור ישראל ישראלי מ-Company LTD. סך התשלומים ברוטו עומד על 7,500.00 ₪, סך הניכויים הוא 813.00 ₪, והנטו לתשלום הוא 6,687.00 ₪. התלוש כולל תשלומים עבור משכורת, נסיעות ושעות נוספות, וכן שווי שימוש בטלפון נייד.",
    "categories": [
      {
        "categoryTitle": "פרטים אישיים",
        "items": [
          {
            "description": "מספר זהות",
            "value": "033333333"
          },
          {
            "description": "מספר העובד",
            "value": "0014"
          },
          {
            "description": "תושב",
            "value": "כן"
          },
          {
            "description": "משרה בי-ל",
            "value": "עיקרית"
          },
          {
            "description": "חלקיות המשרה",
            "value": "1.0000"
          },
          {
            "description": "ותק",
            "value": "01.01.10"
          },
          {
            "description": "תחילת עבודה",
            "value": "01/01/2005"
          },
          {
            "description": "ס. משרה",
            "value": "1-יחידה"
          },
          {
            "description": "בסיס השכר",
            "value": "חודשי"
          },
          {
            "description": "מחלקה",
            "value": "000"
          },
          {
            "description": "מצב משפחתי",
            "value": "ר+0"
          },
          {
            "description": "ותק מ-",
            "value": "01/01/2005"
          },
          {
            "description": "דרגה",
            "value": "000"
          },
          {
            "description": "חשבון",
            "value": "000000000"
          },
          {
            "description": "דרוג",
            "value": "000"
          },
          {
            "description": "בנק",
            "value": "00/000"
          }
        ]
      },
      {
        "categoryTitle": "תשלומים",
        "items": [
          {
            "description": "משכורת",
            "value": "6,500.00 ₪"
          },
          {
            "description": "נסיעות",
            "value": "500.00 ₪"
          },
          {
            "description": "ש.נוספות",
            "value": "500.00 ₪"
          },
          {
            "description": "ש. טל נייד (שווי למס)",
            "value": "100.00 ₪"
          },
          {
            "description": "סה\"כ תשלומים",
            "value": "7,500.00 ₪"
          }
        ]
      },
      {
        "categoryTitle": "נכויי חובה",
        "items": [
          {
            "description": "ב.לאומי",
            "value": "202.92 ₪"
          },
          {
            "description": "מס בריאות",
            "value": "285.30 ₪"
          },
          {
            "description": "פנסיה",
            "value": "219.78 ₪"
          },
          {
            "description": "סה\"כ ניכויי חובה",
            "value": "708.00 ₪"
          }
        ]
      },
      {
        "categoryTitle": "נכויי רשות",
        "items": [
          {
            "description": "ארוחות",
            "value": "105.00 ₪"
          },
          {
            "description": "סה\"כ נכויי רשות",
            "value": "105.00 ₪"
          }
        ]
      },
      {
        "categoryTitle": "הפרשות מעסיק",
        "items": [
          {
            "description": "גמל מעביד",
            "value": "439.56 ₪"
          },
          {
            "description": "ב.לאומי מעביד",
            "value": "334.07 ₪"
          }
        ]
      },
      {
        "categoryTitle": "נתונים נוספים",
        "items": [
          {
            "description": "ימי עבודה",
            "value": "18"
          },
          {
            "description": "שעות עבודה",
            "value": "160.0"
          },
          {
            "description": "שעות הפרדות",
            "value": "0.00"
          },
          {
            "description": "שעות ליום",
            "value": "8.00"
          },
          {
            "description": "נק. רגילות",
            "value": "2.25"
          },
          {
            "description": "אחוז מס שולי",
            "value": "14%"
          },
          {
            "description": "קוד מהדורה",
            "value": "9.71"
          },
          {
            "description": "חישוב מצטבר",
            "value": "1/ק"
          },
          {
            "description": "% הנחה ספר",
            "value": "20%"
          },
          {
            "description": "אופן תשלום",
            "value": "ישירה"
          },
          {
            "description": "ות' בחברה",
            "value": "22 חודשים"
          },
          {
            "description": "ש\"ע בחברה",
            "value": "176.0"
          },
          {
            "description": "שכר ב.לאומי",
            "value": "7,600.00 ₪"
          },
          {
            "description": "שכר מבוטח",
            "value": "6,600.00 ₪"
          },
          {
            "description": "בסיס קרן השתלמות",
            "value": "0.00 ₪"
          },
          {
            "description": "שכר מיני.חודש",
            "value": "3,850.00 ₪"
          },
          {
            "description": "שכר מיני.שעה",
            "value": "20.70 ₪"
          }
        ]
      },
      {
        "categoryTitle": "נתונים מצטברים",
        "items": [
          {
            "description": "תשלומים",
            "value": "15,340.91 ₪"
          },
          {
            "description": "שווי למס",
            "value": "200.00 ₪"
          },
          {
            "description": "סה\"כ ברוטו מצטבר",
            "value": "15,540.91 ₪"
          },
          {
            "description": "ניכוי ב.לאומי",
            "value": "429.48 ₪"
          },
          {
            "description": "ניכוי מס בריאות",
            "value": "587.65 ₪"
          },
          {
            "description": "ניכוי פנסיה",
            "value": "219.78 ₪"
          }
        ]
      },
      {
        "categoryTitle": "חשבון חופשה",
        "items": [
          {
            "description": "יתרה קודמת",
            "value": "7.94 ימים"
          },
          {
            "description": "צבירה",
            "value": "0.83 ימים"
          },
          {
            "description": "ניצול",
            "value": "2.00 ימים"
          },
          {
            "description": "יתרה חדשה",
            "value": "6.77 ימים"
          }
        ]
      },
      {
        "categoryTitle": "חשבון מחלה",
        "items": [
          {
            "description": "יתרה קודמת",
            "value": "27.00 ימים"
          },
          {
            "description": "צבירה",
            "value": "1.50 ימים"
          },
          {
            "description": "ניצול",
            "value": "0.00 ימים"
          },
          {
            "description": "יתרה חדשה",
            "value": "28.50 ימים"
          }
        ]
      }
    ]
  },
  "chatMessages": [
    {
      "sender": "bot",
      "text": "סיימתי לנתח את התלוש. הנתונים מוצגים לצד הצ'אט.\n\nעכשיו אפשר לשאול אותי כל שאלה, או ללחוץ על כל סעיף ברשימה לקבלת הסבר."
    }
  ]
}
];