import { ClientSafeError } from '@rocket.chat/core-services';
import type { ServerMethods } from '@rocket.chat/ddp-client';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';

import { getMomentLocale } from '../../lib/getMomentLocale';

declare module '@rocket.chat/ddp-client' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		loadLocale(locale: string): string | undefined;
	}
}

Meteor.methods<ServerMethods>({
	loadLocale(locale) {
		check(locale, String);

		try {
			return getMomentLocale(locale);
		} catch (error: any) {
			throw new ClientSafeError(error.message, `Moment locale not found: ${locale}`);
		}
	},
});
