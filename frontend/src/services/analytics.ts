import { Mixpanel } from 'mixpanel-react-native';
import { MIXPANEL_TOKEN } from '@env';

const trackAutomaticEvents = false;

const mixpanel = new Mixpanel(MIXPANEL_TOKEN, trackAutomaticEvents);
mixpanel.init();

export default mixpanel; 