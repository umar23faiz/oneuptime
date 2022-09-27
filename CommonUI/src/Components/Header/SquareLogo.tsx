import React, { FunctionComponent, ReactElement } from 'react';

export interface ComponentProps {
    onClick: () => void; 
    logo: string; 
}

const SquareLogo: FunctionComponent<ComponentProps> = (
    props: ComponentProps
): ReactElement => {
    return <img onClick={() => {
        props.onClick && props.onClick();
    }} src={props.logo} height={30} />
};

export default SquareLogo;
