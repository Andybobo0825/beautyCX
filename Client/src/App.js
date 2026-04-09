import { HashRouter, Routes, Route, Link, withRouter } from "react-router-dom";
import { LoginProvider } from "./ContextAPI";
import { PidProvider } from "./ContextAPI";
import { SearchdataProvider } from "./ContextAPI";
import ScrollToTop from "./ScrollToTop";
import ProtectedRoute from './ProtectedRoute';
import LoginPage from "./component/pages/00LoginPage/LoginPage";
import GoodsDetailPage from "./component/pages/00GoodsDetailPage/GoodsDetailPage";
import AboutUsPage from "./component/pages/01AboutUsPage/AboutUsPage";
import HomePage from "./component/pages/01HomePage/HomePage";
import RegisterPage from "./component/pages/00RegisterPage/RegisterPage";
import SettingPage from "./component/pages/00SettingPage/SettingPage";
import ChasingPage from "./component/pages/00ChasingPage/ChasingPage";
import SearchResultPage from "./component/pages/00SearchResultPage/SearchResultPage";


function App() {
  return (
    <HashRouter basename="/">
      <LoginProvider>
      <PidProvider>
      <SearchdataProvider>
        <ScrollToTop /> 
        <Routes>
          <Route index element = {<HomePage/>}/>
          <Route path="LoginPage" element={<LoginPage/>} />
          <Route path="GoodsDetailPage" element={<GoodsDetailPage/>} />
          <Route path="AboutUsPage" element={<AboutUsPage/>} />
          <Route path="RegisterPage" element={<RegisterPage/>} />
          <Route path="SettingPage" element={<SettingPage/>} />
          <Route path="ChasingPage" element={<ChasingPage/>} />
          <Route path="SearchResultPage" element={<SearchResultPage/>} />
          {/* ↑↑新增Route時，path會決定你的頁面網址，element則是放你的頁面組件，比如說上面這個頁面它的網址就會是http://localhost:3000/#/ExamplePage */}

        </Routes>
      </SearchdataProvider>
      </PidProvider>
      </LoginProvider>
    </HashRouter>
  );
}

export default App;
