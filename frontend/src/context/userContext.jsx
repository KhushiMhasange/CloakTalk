import React, { createContext, useState, useEffect} from 'react';
import PropTypes from 'prop-types';

const UserContext = createContext(null);

export const UserProvider = ({children}) =>{
    const [user, setUser] = useState(null); 

    useEffect(()=>{
        const userData = JSON.parse(localStorage.getItem('user'));
        if(userData){
            setUser(userData);
        }
    },[])

    const userContextValue = React.useMemo(()=>({
        user,setUser
    }),[user]);

    return (
        <UserContext.Provider value={userContextValue}>
            {children}
        </UserContext.Provider>
    );

};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export {UserContext};