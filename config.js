// config.js

// This configuration object holds all the static data for the app.
// It makes it easy to update information without changing the main logic.
const CONFIG = {
    APP_NAME: "I Expanse Tracker",
    APP_SLOGAN: "Infinity in Control, Clarity in Spending",
    CURRENCY_SYMBOL: "৳",
    DEVELOPER: {
        NAME: "Md Habibur Rahman Mahi",
        TITLE: "Founder and CEO of Infinity Group",
        PHOTO: "images/Picsart_24-12-22_22-58-18-749.png",
        WHATSAPP: "01727722018",
        TELEGRAM: "01727722018",
        INSTAGRAM: "https://www.instagram.com/h.r_mahi_?igsh=Z242dWFtcDZwdjF2",
        FACEBOOK: "https://www.facebook.com/share/1L8yaf25bk/",
        GROUP_INFO: "Infinity Group is dedicated to building innovative, user-centric digital solutions. Our vision is to empower people through technology, from Bangladesh to the world."
    },
    LOGO_PATH: "images/image (4).png",
    DEFAULT_CATEGORIES: {
        income: ["Salary", "Freelance", "Bonus", "Investment", "Gift"],
        expense: ["Food", "Transport", "Bills", "Shopping", "Health", "Education", "Entertainment", "Family", "Others"]
    },
    INITIAL_BUDGETS: [
        { category: 'Food', amount: 10000 },
        { category: 'Transport', amount: 3000 },
        { category: 'Shopping', amount: 5000 },
    ]
};