import React, { createContext, useState, useEffect} from 'react';
import PropTypes from 'prop-types';

const UserContext = createContext(null);

export const UserProvider = ({children}) =>{
    const [user, setUser] = useState(null); 

    useEffect(()=>{
        const userString = localStorage.getItem('user');
        if (userString && userString !== 'undefined') {
        try {
            const userData = JSON.parse(userString);
            setUser(userData);
            console.log("context user data",userData);
        } catch (error) {
            console.error('Invalid user JSON:', error);
        }
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