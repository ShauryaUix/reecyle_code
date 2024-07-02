import React from 'react';
import Button from './components/button';


const App = () => {
	return (
		<>
    {/* @ts-ignore */}
    <Button color={"brandLight" as string}><>Test</></Button>
		</>
	);
};

export default App;
