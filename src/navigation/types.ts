export type RootStackParamList = {
  Tabs: undefined;
  Home: undefined;
  Chat: undefined;
  Profile: undefined;
  FamilyProfile: undefined;
  NotFound: undefined;
  DisasterRisk: undefined;
  PotentialDangers: undefined;
  DisasterAlert: undefined;
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  ResetPassword: { userID: string };
  EvacuationLocation: undefined;
  DisasterReport: undefined;
  NotifEvacuateLocationScreen: undefined;
  ManageLocations: undefined;
  Notifications: undefined;
  FindFamily: undefined;
  Otp: { email: string; phone: string | null; sendTo: string; from: string };
};
