export type RootStackParamList = {
    Tabs: undefined;
    Home: undefined;
    Chat: undefined;
    Profile: undefined;
    FamilyProfile: undefined;
    NotFound: undefined;
    DisasterRisk: undefined;
    DisasterAlert: undefined;
    Splash: undefined;
    Login: undefined;
    Signup: undefined;
    Otp: { email: string; phone: string | null; sendTo: string; from: string };
};
