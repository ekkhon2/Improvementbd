# Improvement BD - Master Blueprint & Developer Guide Book
## এ টু জেড কমপ্লিট সোর্স কোড ও ডাটাবেজ গাইড বুক (A to Z Source Code & Database Guide)

স্বাগতম! এই মাস্টার গাইড বইটি "Improvement BD" ওয়েব অ্যাপ্লিকেশনের প্রতিটি মডিউল, ডাটাবেজ কালেকশন (Firebase Collection), বাটন ফাংশন, সিকিউরিটি রুলস এবং এডমিন প্যানেল পরিচালনার নিয়ম বিস্তারিতভাবে তুলে ধরেছে। এটি এমনভাবে তৈরি যাতে আপনি এবং আপনার ক্লায়েন্ট ডবল-ওনারশিপের ক্ষেত্রে কোনো জটিলতা ছাড়াই নিজেরা অ্যাপ্লিকেশনটি রক্ষণাবেক্ষণ করতে পারেন।

---

## ১. ওভারভিউ এবং আর্কিটেকচার (Overview & Architecture)

অ্যাপ্লিকেশনটি মূলত **React (TypeScript)**, **Vite**, এবং **Tailwind CSS** দিয়ে একটি আধুনিক ফ্রন্ট-এন্ড স্পা (SPA) আকারে গঠিত। ডেটা প্রোভাইডার ও ব্যাক-এন্ড সার্ভিস হিসেবে **Firebase Firestore Database** এবং ইউজার আইডেন্টিটি ভেরিফিকেশনের জন্য **Google Authentication** ব্যবহৃত হয়েছে। 

### টেকনিক্যাল স্ট্যাক (Technical Stack)
- **Framework & Builder:** React 18, Vite
- **Language:** TypeScript (TSX)
- **Styling UI:** Tailwind CSS (Utility classes) & Shadcn/UI primitives (`Dialog`, `Select`, `Input`, `Card`)
- **Database:** Firebase Firestore (NoSQL Document-based database)
- **Logins & Authentication:** Firebase Google Auth Provider

---

## ২. এডমিন প্যানেল এক্সেস কন্ট্রোল (Admin Access Control)

নিরাপত্তা নিশ্চিত করতে এডমিন লগইন অত্যন্ত কঠোরভাবে লক করা আছে। আপনি ছাড়া অন্য কেউ যাতে এডমিন অ্যাক্সেস না নিতে পারে তার জন্য ফিল্টারিং ব্যবস্থা রয়েছে।

*   **ফাইল পাইলিং (File Source):** `/src/context/AuthContext.tsx` এবং `/src/pages/Admin.tsx`
*   **অনুমোদিত এডমিন:** শুধুমাত্র `ekkhon2@gmail.com` ইমেইল দিয়ে লগইন করলেই এডমিন এক্সেস ট্রিগার হবে।
*   **ফাংশন যেভাবে কাজ করে:**
    1. ইউজার এডমিন পোর্টালে ঢুকতে গেলে Google Auth দিয়ে লগইন করে।
    2. লগইন হওয়ার সাথে সাথে `AuthContext.tsx` পেজে চেক করা হয়: `user.email.toLowerCase().trim() === 'ekkhon2@gmail.com'`।
    3. যদি কন্ডিশন সত্য হয়, তাহলে তাকে `isAdmin = true` সেট করা হয় এবং ড্যাশবোর্ডে এক্সেস দেয়া হয়। অন্য সব ইমেইলের ক্ষেত্রে সরাসরি **Access Denied Dashboard** চলে আসে।

---

## ৩. পেমেন্ট ও ডোনেশন ইকোসিস্টেম (Donation Ecosystem)

কোনো প্রকার চার্জযুক্ত ও পেইড পেমেন্ট গেটওয়ে (যেমন SSL Commerz বা অন্যান্য) ছাড়াই সরাসরি রিয়েল-টাইমে স্বচ্ছ মোবাইল ব্যাংকিং সিস্টেম ইমপ্লিমেন্ট করা হয়েছে।

### ক. মোবাইল ব্যাংকিং নম্বরসমূহ (Active Numbers)
দানকারীদের কাছে সরাসরি ৩টি বিশ্বস্ত মোবাইল পেমেন্ট গেটওয়ে প্রদর্শিত হয়:
1.  **বিকাশ (bKash):** `01711157183` (Personal)
2.  **নগদ (Nagad):** `01712251051` (Personal)
3.  **উপায় (Upay):** `01711157183` (Personal)

### খ. পেমেন্ট ট্র্যাকিং এবং সংরক্ষণ (How donation is stored)
যখনই কোনো দানকারী ফ্রন্ট-এন্ডে **নিচের অনুদান বাটন** ক্লিক করে ফর্মটি সাবমিট করবে, তখন Firestore-এর `'donations'` কালেকশনে একটি নতুন ডকুমেন্ট তৈরি হয়।

#### কালেকশন স্কিমা (Firestore Code Field Mapping):
*   `collection`: `'donations'`
*   `fields`:
    *   `name` (string): দাতার পুরো নাম।
    *   `amount` (number): দানের পরিমাণ।
    *   `method` (string): পেমেন্ট মেথড (যেমন: `bKash`, `Nagad`, `Upay` বা `Other`)।
    *   `sourceNumber` (string): যে নাম্বার থেকে টাকা পাঠানো হয়েছে।
    *   `transactionId` (string): পেমেন্ট ট্রানজেকশন ইউনিক আইডি (TxnID)।
    *   `note` (string): দাতার ঐচ্ছিক বার্তা বা বিশেষ অনুরোধ।
    *   `platform` (string): কোন মহৎ কাজে দান করছেন (যেমন: `poor-fund`, `rehabilitation`, `kidscare`, `food-bank`, `library`)।
    *   `platformName` (string): অনুদান খাতের বাংলা/ইংরেজি নাম।
    *   `status` (string): ভ্যালু হতে পারে `'pending'`, `'approved'`, অথবা `'rejected'`। (ডিফল্ট ভ্যালু সাবমিশনের সময় থাকে `'pending'`)।
    *   `createdAt` (serverTimestamp): প্রদানের সঠিক সময়।

### গ. এডমিন ভেরিফিকেশন ও এ টু জেড হিসাব
এডমিন প্যানেলে **Donations** ট্যাবে প্রতি সেকেন্ডের রিয়েল-টাইম হিসাব পরিষ্কারভাবে ট্র্যাক করা যায়।
*   **Pending status:** নতুন ডোনেশন আসলে তা এখানে "Pending" দেখায়। এডমিন তার পার্সোনাল বিকাশ/নগদ অ্যাকাউন্ট চেক করে সঠিক Transaction ID মিলিয়ে দেখলে "Check (✔)" বাটনে ক্লিক করে ভেরিফাই ও **Approved** করতে পারবেন।
*   **Approved Status:** এপ্রুভ হওয়ার সাথে সাথে সেটি ফ্রন্ট-এন্ডে টোটাল এমাউন্ট কাউন্টারে যুক্ত হয়ে যায়।
*   **Rejected Status:** ফেক ট্রানজেকশন আইডি হলে এডমিন সেটি রিজেক্ট করে দিতে পারেন।
*   **Time log:** ইউজাররা কখন এবং কোন সেকেন্ডে টাকা প্রদান করেছে তার সঠিক টাইমস্ট্যাম্প রিয়েল-টাইম বাংলা ও ইংরেজি ডেট ফরম্যাটে রেসপনসিভ ব্লকের মধ্যে প্রদর্শিত হয়।

---

## ৪. টাইপিং টেস্ট মডিউল (Typing Test Module)

আইটি এডুকেশন প্ল্যাটফর্মের অধীনে শিক্ষার্থীদের টাইপিং ক্যাপাসিটি বাড়াতে একটি নিখুঁত টাইপিং টেস্ট গেম যুক্ত করা হয়েছে।

*   **ফাইল পাইলিং (File Source):** `/src/pages/TypingTest.tsx`
*   **সময় নির্ধারণের বিকল্পসমূহ (Duration Options):**
    *   ১ মিনিট (60 Seconds)
    *   ১০ মিনিট (600 Seconds)
    *   ৩০ মিনিট (1800 Seconds)
*   **ক্যালকুলেশন মেথোডোলজি (How speed and accuracy are calculated):**
    *   **স্পিড (Words Per Minute - WPM):** মূল কারেক্টার লেন্থকে ৫ দিয়ে ভাগ করে মোট অতিক্রান্ত সময় দিয়ে পুনরায় ভাগ করার মাধ্যমে WPM হিসাব করা হয়: `(Characters Typed / 5) / Elapsed Time in minutes`।
    *   **নির্ভুলতা (Accuracy):** ইউজারের ইনপুট করা প্রতিটি ক্যারেক্টারকে সোর্স প্যারাগ্রাফের ক্যারেক্টারের সাথে রিয়েল-টাইম মিলিয়ে শতকরার হিসাব বের করা হয়।
    *   **র‍্যাংক ক্যাটাগরি (Ranks based on WPM):**
        *   WPM < ২০: **Baby**
        *   WPM ২০-৩৯: **Beginner**
        *   WPM ৪০-৫৯: **Intermediate**
        *   WPM >= ৬০: **Pro**

---

## ৫. অন্যান্য ৫টি প্ল্যাটফর্মের ডায়নামিক ম্যানেজমেন্ট (Platform Management)

Improvement BD-এর মূল স্তম্ভ হচ্ছে ৫টি সমাজসেবামূলক প্রতিষ্ঠান। এডমিন সহজেই এগুলোর ব্যানার, ডায়নামিক টেক্সট, এবং লক্ষ্যসমূহ লাইভ এডিট করতে পারেন।

### ৫টি প্ল্যাটফর্মের বিবরণ:
1.  **Fundation Platform:** দরিদ্র সেবা ও মূল ফাউন্ডেশন শাখা।
2.  **Food Bank (ফুড ব্যাংক):** যেখানে নিয়মিত ডায়নামিক ফুড মেনু লাইভ ডোনেশন কার্ড আকারে থাকে।
3.  **Sporting Club:** বিভিন্ন খেলাধুলা বিষয়ক ব্যানার এবং কার্যক্রম পরিচালনা।
4.  **IT Education:** টাইপিং টেস্ট লিংক এবং কম্পিউটার কোর্সের বিবরণ।
5.  **Academic Care:** পরীক্ষার তালিকা ও ডেমো এমসিকিউ এক্সাম।

### ডাটাবেজ তথ্য সংরক্ষণ স্কিমা:
*   **কালেকশন:** `'platform_settings'`
*   **আইডি সমুহ:** `foundation`, `food-bank`, `sporting-club`, `it-education`, `academic-care`
*   **ইনপুট ফিল্ডস:**
    *   `welcomeTitle` / `welcomeSubtitle`
    *   `aboutText`
    *   `stats` (Array of objects containing metrics and counts)

---

## ৬. ডায়নামিক ডাটাবেজ সংগ্রহশালা বিবরণী (Standard Collections Mapping)

ডেভেলপমেন্টে ব্যবহৃত সকল Firestore Collections এর ম্যাপিং ডাটা নিচে উল্লেখ করা হলো:

| কালেকশন নাম (Collection) | কাজের বিবরণ (Purpose) | মূল প্যারামিটারসমূহ (Document fields) |
| :--- | :--- | :--- |
| `donations` | অনুদান ট্র্যাক করার মূল ড্যাশবোর্ড | `id`, `name`, `amount`, `method`, `sourceNumber`, `transactionId`, `note`, `platform`, `platformName`, `status`, `createdAt` |
| `members` | সকল নিবন্ধিত সদস্যের তালিকা ও এডমিন ক্রাড | `id`, `name`, `email`, `phone`, `bloodGroup`, `platform`, `address`, `status`, `createdAt` |
| `blood_donors` | স্বেচ্ছাসেবী রক্তদাতাদের ডাটাবেজ | `id`, `name`, `bloodGroup`, `phone`, `lastDonated`, `location`, `status`, `createdAt` |
| `books` | লাইব্রেরির বইসমূহের তথ্য ও ডাউনলোড লিংক | `id`, `title`, `author`, `category`, `pdfUrl`, `status`, `createdAt` |
| `library_members` | লাইব্রেরির মেম্বারদের কার্ড সংরক্ষণ | `id`, `name`, `memberId`, `phone`, `email`, `status`, `createdAt` |
| `courses` | আইটি এডুকেশন মডিউলের প্রফেশনাল ও ফ্রি কোর্স | `id`, `title`, `description`, `duration`, `mentor`, `status`, `createdAt` |
| `exams` | একাডেমিক কেয়ারের সব এক্সাম প্রসেসিং ডাটা | `id`, `title`, `subject`, `questions` (nested list of MCQs), `duration`, `status` |
| `banners` | মূল স্লাইডার ও ব্যানার ইমেজ লিংক সমূহ | `id`, `title`, `imageUrl`, `active`, `createdAt` |
| `sports_banners`| স্পোর্টিং ক্লাবের একটিভ টুর্নামেন্ট ব্যানার | `id`, `title`, `imageUrl`, `active`, `createdAt` |
| `food_donation_menu` | ফুড ব্যাংকিং ডায়নামিক লাঞ্চ ও ডিনার মেনু | `id`, `title`, `costPerPerson`, `imageUrl`, `active`, `createdAt` |
| `gallery` | ডায়নামিক রেন্ডারিং করা ছবির গ্যালারি | `id`, `title`, `imageUrl`, `category`, `createdAt` |

---

## ৭. ডবল-ওনারশিপ ও ফিউচার মেইনটেন্যান্স টিপস (Double-Ownership Tips)

যেহেতু আপনারা দুইজন এই প্ল্যাটফর্মটির যৌথ মালিক, কাজেই ফিউচার ডেভেলপমেন্ট বা কাস্টমাইজেশনের ক্ষেত্রে নিচের নির্দেশিকাগুলো অত্যন্ত যত্নের সাথে লক্ষ রাখবেন:

1.  **নতুন পেমেন্ট নাম্বার পরিবর্তন:** পরিবর্তন করতে চাইলে `/src/components/DonationModal.tsx` ফাইলটিতে গিয়ে সরাসরি নম্বর টেক্সট এডিট করে নতুন নাম্বার বসাতে পারবেন।
2.  **নতুন কোনো এডমিন ইমেইল যুক্ত করতে চাইলে:** `/src/context/AuthContext.tsx` পাইলে গিয়ে `user.email.toLowerCase().trim() === 'ekkhon2@gmail.com'` এর পাশে `|| user.email.toLowerCase().trim() === 'newadmin@gmail.com'` যুক্ত করে সেভ করলেই হয়ে যাবে।
3.  **ডাটাবেজ রিফ্রেশ বা ক্লিনআপ:** এডমিন প্যানেলের প্রতিটি সেকশনে ডিলিট বা ট্র্যাশ বাটন দেওয়া আছে, যেখান থেকে ডাটা পারমানেন্টলি মুছা সম্ভব। ডাটাবেজ ডিলিট করার সময় সতর্ক থাকুন, কারণ এটি আর ফেরত আনা যাবে না।

---
*গাইড বুকটি পড়ার জন্য আপনাকে ধন্যবাদ। সুখী ও উন্নত সমাজ গঠনে আপনাদের এই ক্ষুদ্র প্রয়াস সাফল্যমণ্ডিত হোক!*
