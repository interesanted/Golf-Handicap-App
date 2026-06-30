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

*Note: Since the app saves data to `LocalStorage`, your scores are saved locally inside that specific browser. If you log a score on your phone and want it on your computer, simply use the **Export Backup** button in the Settings page on your phone, and upload it via **Import Backup** on your computer.*
