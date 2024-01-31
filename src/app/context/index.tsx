'use client';

import React, {createContext, type ReactNode} from 'react';

type ContextType = {
	children: ReactNode;
};

export const Context = createContext<ContextType | undefined>(undefined);

export const GlobalStateProvider: React.FC<{children: ReactNode}> = ({children}) => {
	const contextValue: ContextType = {
		children,
	};

	return (
		<Context.Provider value={contextValue}>
			{children}
		</Context.Provider>
	);
};

export default GlobalStateProvider;
