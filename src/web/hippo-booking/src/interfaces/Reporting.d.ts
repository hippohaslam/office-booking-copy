interface ReportingList {
    id: number;
    name: string;
    description: string;
}



interface ReportingParams {
    id: string;
    name: string;
    description: string;
    parameterJson: Array<{
        id: string;
        fieldType: number;
    }>;
}
