import { useState } from "react";
import DashBoard from "./DashBoard";
import SearchPage from "./SearchPage";

export default function MainContent() {    
    const [showSearchPage, setShowSearchPage] = useState(false);    

    return (
        <div>
            {showSearchPage ? <SearchPage setShowSearchPage={setShowSearchPage}/> : <DashBoard setShowSearchPage={setShowSearchPage}/>}
        </div>
    )
}