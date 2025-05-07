type CanvasToolTipProps = {
  tooltipEnabled: boolean;
  setTooltipEnabled: (value: boolean) => void;
};

const CanvasToolTip = ({ tooltipEnabled, setTooltipEnabled }: CanvasToolTipProps) => {
  return (
    <>
      <div className='color-key__container'>
        <strong>Key:</strong>
        <div className='color-key'>
          <div className='color-block color-block__green'></div>
          <span>- available</span>
        </div>
        <div className='color-key'>
          <div className='color-block color-block__grey'></div>
          <span>- not available</span>
        </div>
        <div className='color-key'>
          <div className='color-block color-block__orange'></div>
          <span>- selected</span>
        </div>
        <div className='color-key'>
          <div className='color-block color-block__white'></div>
          <span>- not selectable</span>
        </div>
      </div>
      <div className='spacer'></div>
      <div className='canvas-options__container'>
        <strong>Canvas options:</strong>
        <div>
          <label htmlFor='enable-tooltip'>Enable tooltip</label>
          <input
            type='checkbox'
            id='enable-tooltip'
            checked={tooltipEnabled}
            onChange={() => {
              setTooltipEnabled(!tooltipEnabled);
            }}
          />
        </div>
      </div>
    </>
  );
};

export default CanvasToolTip;
