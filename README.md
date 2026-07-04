# Clubhouse Golf Handicap Tracker

A free, private, and premium Single-Page Web Application designed to track your golf handicap index. 

This app is optimized for golfers in the Pacific Northwest & Portland Metro area and features a built-in solver for courses that lack official 9-hole ratings.

## 🌟 Features
*   **Handicap Index Dashboard**: Visualizes your handicap trend with interactive charts (using Chart.js) and quick stats.
*   **WHS-Aligned Math**: Computes score differentials and handicap index matching the official WHS rules (including lookup tables and adjustments for under 20 rounds).
*   **9-Hole Solver**: Automatically approximates 9-hole Course Ratings and Slopes from 18-hole tee parameters (Rating/2, same Slope, Par/2) when official 9-hole parameters are unavailable.
*   **Dual Theme**: Clean and premium Clubhouse styling (Clubhouse Light default, Clubhouse Dark alternate).
*   **Data Privacy**: All data is stored locally in your browser's `LocalStorage`. No servers, no signups, no trackers.
*   **Backup & Sync**: Easy-to-use Import/Export JSON buttons to back up your data or transfer scores between your computer and phone.
*   **Preloaded PNW Courses**: 
    *   Mt. Hood Oregon Resort (Foxglove, Pinecone, Thistle)
    *   Heron Lakes Golf Club (Great Blue, Greenback)
    *   Rose City Golf Course
    *   Glendoveer Golf Course (East & West)
    *   Eastmoreland Golf Course

---

## 🚀 How to Run Locally
Just double-click **`index.html`** to open the app instantly in any modern web browser.

---

## 📱 How to Host on GitHub Pages (Free Mobile Access)
To run this app on both your computer and phone, the best method is hosting it for free on **GitHub Pages**:

1.  **Create a GitHub Repository**:
    *   Sign in to [GitHub](https://github.com) (create a free account if you don't have one).
    *   Click **New** to create a repository. Name it something like `golf-handicap`.
    *   Leave the repository **Public** and do not initialize with a README.

2.  **Upload the Files**:
    *   Upload `index.html`, `styles.css`, `app.js`, and `README.md` to your repository. You can do this via the GitHub website (drag-and-drop) or using Git commands:
        ```bash
        git init
        git add .
        git commit -m "Initial commit"
        git branch -M main
        git remote add origin https://github.com/your-username/golf-handicap.git
        git push -u origin main
        ```

3.  **Enable GitHub Pages**:
    *   In your GitHub repository, click on the **Settings** tab.
    *   On the left sidebar, click **Pages** (under the "Code and automation" section).
    *   Under **Build and deployment**, set the Source to **Deploy from a branch**.
    *   Select your branch (e.g. `main`) and `/root` folder, then click **Save**.
    *   After about a minute, GitHub will display your live URL (e.g., `https://your-username.github.io/golf-handicap/`).

4.  **Save as a Phone App**:
    *   Open the live URL on your phone's browser (Safari/Chrome).
    *   Use the **Share** menu (iOS) or **Menu** button (Android) and select **"Add to Home Screen"**. This places a shortcut on your home screen that acts like a standalone app!

## ☁️ How to Enable GitHub Cloud Sync (Computer & Phone Sync)
To keep your data automatically synced in real time across your phone and computer:

1.  **Generate a GitHub Personal Access Token (PAT)**:
    *   Log into [github.com](https://github.com).
    *   Click your profile picture in the top-right corner and select **Settings**.
    *   Scroll down to the bottom of the left sidebar and click **Developer Settings**.
    *   Under **Personal Access Tokens**, select **Fine-grained tokens** and click **Generate new token**.
    *   Name the token `Golf Sync` and set an expiration (e.g., 90 days or custom).
    *   Under **Repository access**, select **Only select repositories** and pick your `Golf-Handicap-App` repository.
    *   Under **Permissions** &rarr; **Repository permissions**, scroll down to **Contents** and change the access dropdown to **Read and write**.
    *   Scroll to the bottom and click **Generate token**.
    *   **Copy the generated token immediately!** (It will start with `github_pat_...` and won't be shown again).

2.  **Activate Sync in the App**:
    *   Open your live app URL on your computer or phone.
    *   Go to the **Settings** tab (gear icon).
    *   Under **GitHub Cloud Synchronization**, type in:
        *   **GitHub Username**: Your GitHub account name.
        *   **Repository Name**: `Golf-Handicap-App` (or the name of your repo).
        *   **Personal Access Token**: Paste the `github_pat_...` token you generated.
    *   Click **Enable GitHub Sync**.

3.  **Set up on your second device**:
    *   Open the live app URL on your second device (e.g. phone).
    *   Go to the **Settings** tab, fill in the exact same username, repo, and token, and click **Enable GitHub Sync**.
    *   The app will automatically pull your existing scores, merge them, and keep them synced every time you add, edit, or delete a round!

<!-- Trigger redeploy -->
