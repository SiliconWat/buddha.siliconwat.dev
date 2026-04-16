import { LitElement } from "lit";

export type Lang = "en" | "km";

const i18nComponents = new Set<LitElement>();

function getDefaultLang(): Lang {
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        return tz === "Asia/Phnom_Penh" ? "km" : "en";
    } catch {
        return "en";
    }
}

let currentLang: Lang =
    (localStorage.getItem("language") as Lang) ?? getDefaultLang();

export function registerI18n(el: LitElement) {
    i18nComponents.add(el);
}

export function unregisterI18n(el: LitElement) {
    i18nComponents.delete(el);
}

export function getLang(): Lang {
    return currentLang;
}

export function setLang(lang: Lang) {
    currentLang = lang;
    localStorage.setItem("language", lang);
    document.documentElement.lang = lang;
    document.title = t("title");
    for (const el of i18nComponents) {
        el.requestUpdate();
    }
}

export function t(key: string, ...args: string[]): string {
    let str = translations[key]?.[currentLang] ?? key;
    args.forEach((arg, i) => {
        str = str.replace(`{${i}}`, arg);
    });
    return str;
}

const translations: Record<string, Record<Lang, string>> = {
    title: { en: "Silicon Wat ℠", km: "Silicon Wat ℠" },

    // hb-header
    "header.openMenu": { en: "Open main menu", km: "បើកបញ្ជីចម្បង" },
    "header.treasury": { en: "Buddha", km: "ព្រះពុទ្ធ" },
    "header.beta": { en: "beta", km: "បេតា" },
    "header.khmer": { en: "Khmer", km: "ខ្មែរ" },
    "header.english": { en: "English", km: "អង់គ្លេស" },

    // hb-menu
    "menu.closeMenu": { en: "Close menu", km: "បិទបញ្ជី" },
    "menu.familyBank": { en: "Family Bank", km: "ធនាគារគ្រួសារ" },
    "menu.createAccount": { en: "Create Account", km: "បង្កើតគណនី" },
    "menu.proofOfHumanity": {
        en: "Proof of Humanity ℠",
        km: "ភស្តុតាងនៃភាពជាមនុស្ស ℠"
    },
    "menu.logOut": { en: "Log Out", km: "ចាកចេញ" },
    "menu.readBedok": {
        en: "Read Bedok",
        km: "អានបិដក"
    },
    "menu.dharma": {
        en: "Dharma",
        km: "ព្រះធម៌"
    },
    "menu.sangha": {
        en: "Sangha",
        km: "ព្រះសង្ឃ"
    },
    "menu.createFamilyBank": {
        en: "Join Waitlist",
        km: "ចូលរួមក្នុងបញ្ជីរង់ចាំ"
    },
    "menu.phoneLogin": { en: "Phone Login", km: "ចូលប្រើតាមទូរស័ព្ទ" },
    "menu.settings": { en: "Settings", km: "ការកំណត់ប្រព័ន្ធ" },

    // hb-footer
    "footer.slogan": { en: "Thank with", km: "អរគុណជាមួយ" },
    "footer.videoTutorials": { en: "Video Tutorials", km: "វីដេអូ ណែនាំ" },
    "footer.dearAquarius": {
        en: "Dear Aquarius™",
        km: "ជូនចំពោះ អាក្វារីយូស ™"
    },
    "footer.downloadApp": { en: "Install App", km: "សូមដំឡើង កម្មវិធី" },
    "footer.darkMode": { en: "Dark Mode", km: "ពន្លឺ ពេលយប់" },
    "footer.autoMode": { en: "Auto Mode", km: "ពន្លឺ ស្វ័យប្រវត្តិ" },
    "footer.lightMode": { en: "Light Mode", km: "ពន្លឺ ពេលថ្ងៃ" },

    // page-login
    "login.success": {
        en: "You have been logged in successfully!",
        km: "អ្នកបានចូលប្រើប្រាស់ដោយជោគជ័យ!"
    },
    "login.title": { en: "HeartBank® Login", km: "ចូលប្រើប្រាស់ HeartBank®" },
    "login.yourPhone": { en: "Your Phone Number", km: "លេខទូរស័ព្ទរបស់អ្នក" },
    "login.loggingIn": { en: "Logging you in...", km: "កំពុងបញ្ជូនអ្នកចូល..." },
    "login.sending": { en: "Sending...", km: "កំពុងបញ្ជូន..." },
    "login.sendCode": {
        en: "Send Verification Code",
        km: "បញ្ជូនលេខកូដ"
    },
    "login.codeSent": {
        en: "A verification code has been sent to {0}",
        km: "លេខកូដត្រូវបានបញ្ជូនទៅកាន់ {0} ហើយ។"
    },
    "login.enterCode": {
        en: "Enter Verification Code",
        km: "បញ្ចូលលេខកូដ"
    },
    "login.verificationCode": {
        en: "Verification Code",
        km: "លេខកូដ"
    },
    "login.verify": { en: "Verify", km: "ផ្ទៀងផ្ទាត់" },
    "login.differentPhone": {
        en: "Use a different phone number",
        km: "ប្រើលេខទូរស័ព្ទផ្សេង"
    },
    "login.invalidCode": {
        en: "Invalid verification code. Please try again.",
        km: "លេខកូដមិនត្រឹមត្រូវ។ សូមព្យាយាមម្ដងទៀត។"
    },
    "login.sendFailed": {
        en: "Failed to send verification code. Please try again.",
        km: "មិនអាចបញ្ជូនលេខកូដផ្ទៀងផ្ទាត់បានទេ។ សូមព្យាយាមម្ដងទៀត។"
    },
    "login.loginFailed": {
        en: "Failed to log in. Please try again.",
        km: "ការចូលប្រើប្រាស់មិនជោគជ័យទេ។ សូមព្យាយាមម្ដងទៀត។"
    },
    "login.footer": {
        en: "❤️ Proof of Humanity by HeartBank®",
        km: "❤️ ភស្តុតាងនៃភាពជាមនុស្ស ដោយ HeartBank®"
    },

    // page-settings
    "settings.title": { en: "Settings", km: "ការកំណត់ប្រព័ន្ធ" },
    "settings.notifications": {
        en: "Push Notifications",
        km: "ការជូនដំណឹង"
    },
    "settings.notificationsDesc": {
        en: "Receive notifications when you get new thanks",
        km: "ទទួលការ ជូនដំណឹង ពេលអ្នកទទួលបាន ការអរគុណថ្មី"
    },
    "settings.enable": { en: "Enable", km: "បើក" },
    "settings.disable": { en: "Disable", km: "បិទ" },
    "settings.enabled": {
        en: "Notifications enabled",
        km: "បានបើកការជូនដំណឹង"
    },
    "settings.disabled": {
        en: "Notifications disabled",
        km: "បានបិទការជូនដំណឹង"
    },
    "settings.unsupported": {
        en: "Push notifications are not supported on this device",
        km: "ការជូនដំណឹងមិនអាចប្រើបានលើឧបករណ៍នេះទេ"
    },
    "settings.denied": {
        en: "Notification permission was denied. Please enable it in your browser settings.",
        km: "សិទ្ធិជូនដំណឹងត្រូវបានបដិសេធ។ សូមបើកវានៅក្នុងការកំណត់កម្មវិធីរុករក។"
    },

    "settings.installPrompt": {
        en: "To receive push notifications, install this app on your device. ",
        km: "ដើម្បីទទួលការជូនដំណឹង សូមដំឡើងកម្មវិធីលើឧបករណ៍របស់អ្នក។ "
    },
    "settings.installLink": {
        en: "Install Now",
        km: "ដំឡើងឥឡូវនេះ"
    },

    // page-install
    "pwa.title": {
        en: "Install App",
        km: "ដំឡើងកម្មវិធី"
    },
    "pwa.description": {
        en: "Install HeartBank® on your device to receive push notifications for the best experience",
        km: "សូមដំឡើងកម្មវិធី HeartBank® លើឧបករណ៍របស់អ្នក ដើម្បីទទួលបានការជូនដំណឹង (Push Notifications) សម្រាប់បទពិសោធន៍ប្រើប្រាស់ដ៏ល្អបំផុត។"
    },
    "pwa.installButton": { en: "Install Now", km: "ដំឡើងឥឡូវនេះ" },
    "pwa.alreadyInstalled": { en: "Already Installed!", km: "បានដំឡើងរួចហើយ!" },
    "pwa.alreadyInstalledDesc": {
        en: "HeartBank® is already installed on your device 🎉",
        km: "HeartBank® ត្រូវបានដំឡើងលើឧបករណ៍របស់អ្នករួចហើយ។"
    },
    "pwa.iosTitle": { en: "Install on iPhone/iPad", km: "ដំឡើងលើ iPhone/iPad" },
    "pwa.iosStep1": {
        en: "Tap the Share button (□↑) in Safari",
        km: "ចុចប៊ូតុង Share (□↑) នៅក្នុង Safari"
    },
    "pwa.iosStep2": {
        en: 'Scroll down and tap "Add to Home Screen"',
        km: 'រមូរចុះក្រោម ហើយចុច "Add to Home Screen"'
    },
    "pwa.iosStep3": {
        en: 'Tap "Add" to confirm',
        km: 'ចុច "Add" ដើម្បីបញ្ជាក់'
    },
    "pwa.manualTitle": {
        en: "Install on your device",
        km: "ដំឡើងលើឧបករណ៍របស់អ្នក"
    },
    "pwa.manualStep1": {
        en: "Open browser menu (⋮ or ⋯)",
        km: "បើកម៉ឺនុយកម្មវិធីរុករក (⋮ ឬ ⋯)"
    },
    "pwa.manualStep2": {
        en: 'Select "Install app" or "Add to Home Screen"',
        km: 'ជ្រើសរើស "Install app" ឬ "Add to Home Screen"'
    },
    "pwa.manualStep3": {
        en: "Confirm the installation",
        km: "បញ្ជាក់ការដំឡើង"
    },

    // page-tutorials
    "tutorials.title": { en: "Quick Tutorials", km: "មេរៀនណែនាំ" },
    "tutorials.description": {
        en: "Learn how to use HeartBank® step by step",
        km: "រៀនពីរបៀបប្រើ HeartBank® មួយជំហានម្ដងៗ"
    },
    "tutorial.step": { en: "Step", km: "ជំហានទី" },
    "tutorial.steps": { en: "steps", km: "ជំហាន" },
    "tutorial.next": { en: "Next", km: "បន្ទាប់" },
    "tutorial.prev": { en: "Back", km: "ថយក្រោយ" },
    "tutorial.done": { en: "Done", km: "រួចរាល់" },
    "tutorial.comingSoon": { en: "Coming soon", km: "នឹងមកដល់ឆាប់ៗ" },

    "tutorial.installApp.title": {
        en: "How to Install App",
        km: "របៀបដំឡើងកម្មវិធី"
    },
    "tutorial.installApp.step1": {
        en: "Tap on the ⋯ (menu) icon",
        km: "ចុចលើរូបតំណាង ⋯ (ម៉ឺនុយ)"
    },
    "tutorial.installApp.step2": {
        en: 'Tap on "Open in external browser"',
        km: "ចុចលើ (Open in external browser)"
    },
    "tutorial.installApp.step3": {
        en: "Tap on the ⋯ (menu) icon",
        km: "ចុចលើរូបតំណាង ⋯ (ម៉ឺនុយ)"
    },
    "tutorial.installApp.step4": {
        en: 'Tap on "Share" button',
        km: "ចុចលើប៊ូតុង (Share)"
    },
    "tutorial.installApp.step5": {
        en: 'Tap on "Add to Home Screen"',
        km: "ចុចលើ (Add to Home Screen)"
    },
    "tutorial.installApp.step6": {
        en: 'Tap on "Add" button',
        km: "ចុចលើប៊ូតុង (Add)"
    },
    "tutorial.installApp.step7": {
        en: "You should now see the HeartBank® app icon on your Home Screen 🎉",
        km: "ឥឡូវនេះ អ្នកនឹងឃើញរូបតំណាងកម្មវិធី **HeartBank®** នៅលើអេក្រង់ដើម (Home Screen) របស់អ្នកហើយ! 🎉"
    },

    "tutorial.phoneLogin.title": {
        en: "How to Log In via Phone",
        km: "របៀបចូលប្រើតាមទូរស័ព្ទ"
    },
    "tutorial.phoneLogin.step1": {
        en: "Tap on the ☰ (menu) icon",
        km: "សូមចុចលើរូបតំណាង ☰ (ម៉ឺនុយ)"
    },
    "tutorial.phoneLogin.step2": {
        en: 'Tap on "Phone Login"',
        km: 'សូមចុចលើពាក្យ "ចូលប្រើតាមទូរស័ព្ទ"'
    },
    "tutorial.phoneLogin.step3": {
        en: "Select your country code (+1) and enter your phone number",
        km: "ជ្រើសរើសលេខកូដប្រទេស (+855) ហើយបញ្ចូលលេខទូរស័ព្ទរបស់អ្នក"
    },
    "tutorial.phoneLogin.step4": {
        en: 'Tap on "Send Verification Code"',
        km: 'សូមចុចលើពាក្យ "បញ្ជូនលេខកូដ"'
    },
    "tutorial.phoneLogin.step5": {
        en: "You should see a message asking you to check your text messages",
        km: "អ្នកនឹងឃើញសារមួយដែលប្រាប់អ្នកឱ្យទៅពិនិត្យមើលសារ (SMS) ក្នុងទូរស័ព្ទ"
    },
    "tutorial.phoneLogin.step6": {
        en: "Open your messages and find the 6-digit verification code",
        km: "សូមបើកសាររបស់អ្នក ហើយស្វែងរកលេខកូដបញ្ជាក់ ៦ ខ្ទង់"
    },
    "tutorial.phoneLogin.step7": {
        en: "Enter the 6-digit code in this app",
        km: "សូមបញ្ចូលលេខកូដ ៦ ខ្ទង់ ទៅក្នុងកម្មវិធីនេះ"
    },
    "tutorial.phoneLogin.step8": {
        en: 'Tap "Verify" to log in',
        km: 'សូមចុចលើពាក្យ "ផ្ទៀងផ្ទាត់" ដើម្បីចូលប្រើប្រាស់'
    },
    "tutorial.phoneLogin.step9": {
        en: "You should see this success message",
        km: "អ្នកនឹងឃើញសារបញ្ជាក់ពីជោគជ័យ"
    },
    "tutorial.phoneLogin.step10": {
        en: "After a few seconds, your beating heart will appear which means you've successfully logged in! 🎉",
        km: "បន្ទាប់ពីពីរបីវិនាទីក្រោយមក រូបបេះដូងលោតរបស់អ្នកនឹងបង្ហាញឡើង ដែលមានន័យថាអ្នកបានចូលប្រើប្រាស់ដោយជោគជ័យហើយ! 🎉"
    },

    "tutorial.notifications.title": {
        en: "How to Enable Push Notifications",
        km: "របៀបបើកការជូនដំណឹង"
    },
    "tutorial.notifications.step1": {
        en: "Login and tap on the ☰ (menu) icon",
        km: "សូមចូលប្រើប្រាស់ រួចចុចលើរូបតំណាង ☰ (ម៉ឺនុយ)"
    },
    "tutorial.notifications.step2": {
        en: 'Tap on "Settings"',
        km: 'សូមចុចលើពាក្យ "ការកំណត់ប្រព័ន្ធ"'
    },
    "tutorial.notifications.step3": {
        en: 'Tap on "Enable"',
        km: 'ចុច "បើក"'
    },
    "tutorial.notifications.step4": {
        en: "Allow notifications when your browser asks",
        km: "សូមចុច (Allow) នៅកម្មវិធីរុករក (Browser) របស់អ្នក ដើម្បីទទួលបានការជូនដំណឹង"
    },
    "tutorial.notifications.step5": {
        en: "When you see this message, you have successfully registered for Push Notifications 🎉",
        km: "នៅពេលអ្នកឃើញសារនេះ មានន័យថាអ្នកបានចុះឈ្មោះសម្រាប់ ការជូនដំណឹង (Push Notifications) បានជោគជ័យហើយ! 🎉"
    },

    "tutorial.familyBank.title": {
        en: "How to Create a Family Bank",
        km: "របៀបបង្កើតធនាគារគ្រួសារ"
    },
    "tutorial.familyBank.step1": {
        en: "Sign in to your account first.",
        km: "ចូលប្រើគណនីរបស់អ្នកជាមុនសិន។"
    },
    "tutorial.familyBank.step2": {
        en: 'Open the menu and tap "Create Family Bank".',
        km: 'បើកម៉ឺនុយ ហើយចុច "បង្កើតធនាគារគ្រួសារ"។'
    },
    "tutorial.familyBank.step3": {
        en: "Give your family bank a name and confirm.",
        km: "ដាក់ឈ្មោះធនាគារគ្រួសាររបស់អ្នក ហើយបញ្ជាក់។"
    },

    "tutorial.familyMember.title": {
        en: "How to Create a Family Member Account",
        km: "របៀបបង្កើតគណនីសមាជិកគ្រួសារ"
    },
    "tutorial.familyMember.step1": {
        en: 'Open the menu and tap "Create Account".',
        km: 'បើកម៉ឺនុយ ហើយចុច "បង្កើតគណនី"។'
    },
    "tutorial.familyMember.step2": {
        en: "Enter the family member's name (e.g. @son, @daughter).",
        km: "បញ្ចូលឈ្មោះសមាជិកគ្រួសារ (ឧ. @កូនប្រុស @កូនស្រី)។"
    },
    "tutorial.familyMember.step3": {
        en: "Choose a profile photo for the account.",
        km: "ជ្រើសរើសរូបថតប្រវត្តិរូបសម្រាប់គណនី។"
    },
    "tutorial.familyMember.step4": {
        en: "Confirm to create the account. You can switch between accounts from the menu.",
        km: "បញ្ជាក់ដើម្បីបង្កើតគណនី។ អ្នកអាចប្ដូរគណនីពីម៉ឺនុយ។"
    },

    "tutorial.thankMyself.title": {
        en: "How to Thank Myself",
        km: "របៀបថ្លែងអំណរគុណដល់ខ្លួនឯង"
    },

    "tutorial.sendThanks.title": {
        en: "How to Send Thanks",
        km: "របៀបផ្ញើការអរគុណ"
    },
    "tutorial.sendThanks.step1": {
        en: "Sign in and go to the home page.",
        km: "ចូលប្រើ ហើយទៅកាន់ទំព័រដើម។"
    },
    "tutorial.sendThanks.step2": {
        en: "Tap the heart crystal to compose your thanks.",
        km: "ចុចគ្រីស្តាល់បេះដូង ដើម្បីសរសេរការអរគុណរបស់អ្នក។"
    },
    "tutorial.sendThanks.step3": {
        en: "Choose a recipient and send your heartfelt thanks!",
        km: "ជ្រើសរើសអ្នកទទួល ហើយផ្ញើការអរគុណដោយស្មោះរបស់អ្នក!"
    },

    // page-not-found
    "notFound.title": { en: "Coming Soon!", km: "នឹងមកដល់ឆាប់ៗនេះ!" },
    "notFound.subtitle": {
        en: "Currently in development",
        km: "កំពុងស្ថិតក្នុងការអភិវឌ្ឍន៍"
    }
};

document.documentElement.lang = currentLang;
document.title = translations.title[currentLang];
