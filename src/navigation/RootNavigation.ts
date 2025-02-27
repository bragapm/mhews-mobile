import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<RouteName extends keyof RootStackParamList>(name: RouteName) {
    if (navigationRef.isReady()) {
        navigationRef.navigate(name as any);
    }
}
