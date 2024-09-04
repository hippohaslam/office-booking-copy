export interface SvgAsset {
    name: string | undefined;
    path: string;
}

const GetSvgEditorAssets = (): SvgAsset[] => {
    // can change this to an S3 bucket in future if we need to.
    const svgs = import.meta.glob("/public/assets/*.svg");

    const svgArray: SvgAsset[] = Object.keys(svgs).map((key) => {
        const fileName = key.split("/").pop()?.replace(".svg", "");
        return { name: fileName, path: key.replace("/public", "") };
    });

    return svgArray;
};

export default GetSvgEditorAssets;