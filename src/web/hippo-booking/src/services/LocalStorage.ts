export type AdditionalCanvasOptions = {
    enableTooltip: boolean;
}

const additionalCanvasOptionsKey = 'bookingCanvasOptions';

export const getAdditionalCanvasOptions = (): AdditionalCanvasOptions => {
    const options = localStorage.getItem(additionalCanvasOptionsKey);
    return options ? JSON.parse(options) : { enableTooltip: true };
}

export const setAdditionalCanvasOptions = (options: AdditionalCanvasOptions) => {
    localStorage.setItem(additionalCanvasOptionsKey, JSON.stringify(options));
}