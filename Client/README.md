# 專案規格
1. 命名頁面名稱時外層請命名為 XXXPage.js ，內層請命名為 XXXBody.js，然後頁面主體請寫在內層裡

2. 由於css格式會跨頁面影響，為了避免重複名稱，在命名className時請按照以下規則

    1.  className 請寫成單字首字母大寫的形式，且盡量單字與組件內容相關，方便其他人看你的東西
    例: 訂單的表格用的className → className="OrdersTable"

    2.  內層的className請加上上層className的首字母大寫
    例: 訂單的表格內的客戶名稱的className  → className="OTClientName"

3. 寫css文件時，單位請盡量使用 vw 或 % ，不要使用px或cm之類的，這兩個單位可以讓網頁內容隨視窗寬度自動調整大小

    1. 使用vw單位，要變更文字大小時，需要同時變更 font-size 與 line-height 兩個屬性

    2. 製作頁面時可以的話，多使用 display: flex 來設計排版，方便其他人看你的東西 (這條不強迫)

4. 製作頁面有需要可以添加Library，但需要把添加Library寫在下面這邊，並在套件名後面標註: (新增)

5. 我有製作一個範例頁面模板在 src > component > pages > 00ExamplePage，可以直接整個資料夾複製過去改

6. 掛載頁面時要去 App.js 掛載，文件裡面有教學

7. 傳要檔案給其他人時，不要連同 node_modules 資料夾一起壓縮，不然檔案會太大



================<br/>
## Library (安裝指令: npm install 套件名)
> React.js
> React.bootstrap
> react-router-dom 
> npm install react-icons
> npm install react-hook-form
> npm install axios
> npm install date-fns
> npm install react-slick slick-carousel

## Directors
其他系統上線要用的資料麻煩 @Andybobo 加上去
```
project/
|──Client
|   └──src/     # 代碼目錄
|       └──component/   #所有元件存放處
|           |
|           |──BasicFrame/  #誤動，存放網頁基本架構，請勿擅自增加檔案或修改
|           |   |
|           |   |──css/         #用來存放BasicFrame的css檔案
|           |   |──pic/         #用來存放BasicFrame有關的圖檔
|           |   |──frame.js     #主要文件
|           |   └──...          #其他資料夾/檔案    
|           |     
|           └──pages/       #網頁其他頁面
|               |
|               |──HomePage/    #(舉例說明用)用來存放主畫面的頁面
|               |──LoginPage/  #(舉例說明用)依照存放的類型作命名
|               └──...          #其他
|──Server
|   |──*沒寫過python 後端不知道有沒有需要entry    #entry
|   |──pages/
|   |   └── (function page).py  #API function
|   └──module/                  #database connection
|       └──db_connect.py
```

<hr>

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
