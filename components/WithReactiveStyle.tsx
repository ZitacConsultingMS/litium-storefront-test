import { useTranslations } from 'hooks/useTranslations';
import React, { ReactNode, useEffect, useRef, useState } from 'react';

const StateStyles = {
  LOADING: '--loading',
  SUCCESS: '--success',
  ERROR: '--error',
};

/**
 * Represents a HOC which wraps a Button and applies diffrent styles to it
 * depending on its click state.
 * @param WrappedComponent The button component.
 * @param onClick The async button's onClick event. It should return true if everything is OK, or false if there is any error.
 * @param stylePrefix The style prefix to append state's modifiers. For example, 'button' will result as 'button--loading'.
 * @param label The default label of button
 * @param successLabel The label to display when onClick event runs successfully
 *
 * Some available props that the HOC component supports:
 * autoReset : it is true by default. Not its value, but the behaviour is like that. Unless people set it as false, by default, button is always reset to neutral state after the request is completed.
 * resetTimeout: Number milisecond after the complete state, the style of button will be reset. If don't set, it is 2000
 * minimumLoadingTime: Mininum milisecond to display the loading state. If don't set, it is 1000
 */
export default function WithReactiveStyle({
  WrappedComponent,
  onClick,
  stylePrefix,
  label,
  successLabel,
  ...props
}: {
  WrappedComponent: (props: any) => React.JSX.Element | ReactNode;
  onClick: (...params: any) => void;
  stylePrefix: string;
  label: string;
  successLabel: string;
  [key: string]: any;
}) {
  const [stateClass, setStateClass] = useState('');
  const [labelValue, setLabelValue] = useState(label);
  const t = useTranslations();
  const startTime = useRef(0);

  useEffect(() => {
    return () => {
      setStateClass('');
    };
  }, []);

  function onNeutralState() {
    setStateClass('');
    startTime.current = 0;
  }

  function onLoadingState() {
    setStateClass(`${stylePrefix}${StateStyles.LOADING}`);
    startTime.current = Date.now();
  }

  const changeState = (complete: any) => {
    if (complete) {
      setStateClass(`${stylePrefix}${StateStyles.SUCCESS}`);

      // set success label with checkmark
      setLabelValue(`${t(successLabel)}`);
    } else {
      setStateClass(`${stylePrefix}${StateStyles.ERROR}`);
    }

    // if `autoReset` is true, which is default, the style will be changed
    // to default label and neutral after a `resetTimeout` amount of time (2 seconds by default).
    props.autoReset !== false &&
      setTimeout(() => {
        onNeutralState();
        setLabelValue(label);
      }, props.resetTimeout || 2000);
  };

  function onComplete(complete: any) {
    const loadingDuration = Date.now() - startTime.current;
    const minimumLoadingTime = props.minimumLoadingTime || 1000;
    // ensure the loading indicator is displayed at least a `minimumLoadingTime`
    // amount of time before changing it to Success or Error.
    if (loadingDuration >= minimumLoadingTime) {
      changeState(complete);
    } else {
      setTimeout(() => {
        changeState(complete);
      }, minimumLoadingTime - loadingDuration);
    }
  }

  async function onButtonClick(params: any) {
    onLoadingState();
    const data = await onClick(params);
    onComplete(data);
  }

  return (
    <span className={stateClass} data-testid="reactive-wrapper">
      <WrappedComponent
        onClick={(params: any) => onButtonClick(params)}
        label={labelValue}
        {...props}
      />
    </span>
  );
}
