import { ClientSafeError } from '@rocket.chat/core-services';
import { Meteor } from 'meteor/meteor';
import type { ServerMethods } from '@rocket.chat/ddp-client';
import { Users } from '@rocket.chat/models';

import { hasPermissionAsync } from '../../../../../server/lib/authorization/hasPermission';
import { twoFactorRequired } from '../../../../../server/lib/2fa/twoFactorRequired';
declare module '@rocket.chat/ddp-client' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		'personalAccessTokens:removeToken'(params: { tokenName: string }): Promise<void>;
	}
}

export const removePersonalAccessTokenOfUser = async (tokenName: string, userId: string): Promise<void> => {
	if (!(await hasPermissionAsync(userId, 'create-personal-access-tokens'))) {
		throw new ClientSafeError('not-authorized', 'Not Authorized', {
			method: 'personalAccessTokens:removeToken',
		});
	}
	const tokenExist = await Users.findPersonalAccessTokenByTokenNameAndUserId({
		userId,
		tokenName,
	});
	if (!tokenExist) {
		throw new ClientSafeError('error-token-does-not-exists', 'Token does not exist', {
			method: 'personalAccessTokens:removeToken',
		});
	}
	await Users.removePersonalAccessTokenOfUser({
		userId,
		loginTokenObject: {
			type: 'personalAccessToken',
			name: tokenName,
		},
	});
};

Meteor.methods<ServerMethods>({
	'personalAccessTokens:removeToken': twoFactorRequired(async function ({ tokenName }: { tokenName: string }) {
		const uid = Meteor.userId();
		if (!uid) {
			throw new ClientSafeError('not-authorized', 'Not Authorized', {
				method: 'personalAccessTokens:removeToken',
			});
		}

		return removePersonalAccessTokenOfUser(tokenName, uid);
	}),
});
