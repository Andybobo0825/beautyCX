import React, { createContext, useState } from 'react';

export const LoginContext = createContext();
export const LoginProvider = ({ children }) => {
  const [login, setLogin] = useState(0);

  return (
    <LoginContext.Provider value={{ login, setLogin }}>
      {children}
    </LoginContext.Provider>
  );
};

export const PidContext = createContext();
export const PidProvider = ({ children }) => {
  const [pid, setPid] = useState("p0000");

  return (
    <PidContext.Provider value={{ pid, setPid }}>
      {children}
    </PidContext.Provider>
  );
};

export const SearchdataContext = createContext();
export const SearchdataProvider = ({ children }) => {
  const [Searchdata, setSearchdata] = useState([]);

  return (
    <SearchdataContext.Provider value={{ Searchdata, setSearchdata }}>
      {children}
    </SearchdataContext.Provider>
  );
};

export const ClientIdContext = createContext({
  clientId: null,
  setClientId: () => { }
});
export const ClientIdProvider = ({ children }) => {
  const [clientId, setClientId] = useState(null);

  return (
    <ClientIdContext.Provider value={{ clientId, setClientId }}>
      {children}
    </ClientIdContext.Provider>
  );
};

/**遮罩 */
export const MaskContext = createContext({
  mask: false,
  setMask: () => { }
});
export const MaskProvider = ({ children }) => {
  const [mask, setMask] = useState(false);
  return (
    <MaskContext.Provider value={{ mask, setMask }}>
      {children}
      {mask && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.3)",
            zIndex: 9999
          }}
        >
          <div className="spinner-border" role="status" />
        </div>
      )}
    </MaskContext.Provider>
  );
};


