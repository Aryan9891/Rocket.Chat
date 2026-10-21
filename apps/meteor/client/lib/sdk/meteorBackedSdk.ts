// The transport is always DDPSDK, so only the storage backend switch remains.
import { setStorageBackend } from './storage';

export const FORGET_SESSION_SETTING_ID = 'Accounts_ForgetUserSessionOnWindowClose';

declare global {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Window {
		[FORGET_SESSION_SETTING_ID]?: boolean;
	}
}

declare module '@rocket.chat/ddp-client' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface DDPSDK {
		storage: {
			changeStorageBackend: () => void;
		};
	}
}

export const createMeteorBackedStorage = () => ({
	changeStorageBackend: () => {
		setStorageBackend(window[FORGET_SESSION_SETTING_ID] ? 'session' : 'local');
	},
});

export const createMeteorBackedSdk = (): never => {
	throw new Error('The Meteor-backed SDK no longer exists');
};
