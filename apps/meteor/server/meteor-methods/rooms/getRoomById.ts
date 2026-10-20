import { ClientSafeError } from '@rocket.chat/core-services';
import type { IRoom, IUser } from '@rocket.chat/core-typings';
import type { ServerMethods } from '@rocket.chat/ddp-client';
import { Rooms } from '@rocket.chat/models';
import { check } from 'meteor/check';
import { DDPRateLimiter } from 'meteor/ddp-rate-limiter';
import { Meteor } from 'meteor/meteor';

import { canAccessRoomAsync } from '../../lib/authorization';

declare module '@rocket.chat/ddp-client' {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface ServerMethods {
		getRoomById(rid: IRoom['_id']): IRoom;
	}
}

Meteor.methods<ServerMethods>({
	async getRoomById(rid) {
		check(rid, String);
		const userId = Meteor.userId();
		if (!userId) {
			throw new ClientSafeError('error-invalid-user', 'Invalid user', {
				method: 'getRoomNameById',
			});
		}

		const room = await Rooms.findOneById(rid);
		if (room == null) {
			throw new ClientSafeError('error-not-allowed', 'Not allowed', {
				method: 'getRoomNameById',
			});
		}
		if (!(await canAccessRoomAsync(room, (await Meteor.userAsync()) as IUser))) {
			throw new ClientSafeError('error-not-allowed', 'Not allowed', {
				method: 'getRoomById',
			});
		}
		return room;
	},
});

DDPRateLimiter.addRule(
	{
		type: 'method',
		name: 'getRoomById',
		userId() {
			return true;
		},
	},
	10,
	60000,
);
