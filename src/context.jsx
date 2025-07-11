import { createContext, useEffect,useContext } from "react";
import useFetch from "./hooks/use-fetch";
import { getCurrentUser } from "../db/apiAuth";
const UrlContext = createContext();

const UrlProvider= ({children}) => {
    const {data:user,loading,fn:fetchUser} =useFetch(async () => {
        return await getCurrentUser();
    });

    const isAuthenticated = user?.role === "authenticated";

    useEffect(() =>{
        fetchUser();

    },[]);


    return( <UrlContext.Provider value={{user,fetchUser,loading,isAuthenticated}}>
        {children}
    </UrlContext.Provider>
    );

};

export const UrlState= () => {
    return useContext(UrlContext);
};
export default UrlProvider;