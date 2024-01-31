import { NextResponse } from 'next/server';
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import connectToMongoDb from '@/app/libs/mongodb';
import PeopleModel from '@/app/models/people';
import {PeopleData, Person} from '@/app/types';

const GET = withApiAuthRequired(async () => {
	try {
		await connectToMongoDb();

		const session = await getSession();

		if (!session?.accessToken || !session.user) {
			return NextResponse.json({ error: 'Invalid or missing access token or user in the session' }, { status: 401 });
		}

		const userId = session.user.sub as string;

		const myProfileObject = await PeopleModel.findOne(
			{ people: { $elemMatch: { id: userId } } },
			{ 'people.$': 1 }
		).lean() as PeopleData;

		if (!myProfileObject) {
			return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
		}

		const friendIds = myProfileObject.people.map((friend: { id: string }) => friend.id) as string[];

		const data = await PeopleModel.find({}).lean();
		const allPeople = data.flatMap(entry => entry.people) as Person[];

		const myFriends = allPeople
			.filter((person) => friendIds.includes(person.id))
			.map(({ id, forename, surname, dob, ssn, issuedDateAndTime, friends, image, primaryLocation }: Person) => ({
				id: id as string,
				forename,
				surname,
				dob,
				ssn,
				issuedDateAndTime,
				friends: friends.map((friendId: string) => {
					const friendObject = allPeople.find(f => f.id === friendId);
					return friendObject ? { id: friendObject.id as string, forename: friendObject.forename, surname: friendObject.surname, dob: friendObject.dob, friends: friendObject.friends } : null;
				}),
				image,
				primaryLocation,
			}));

		myFriends.sort((a, b) => {
			const forenameA = (a.forename || '').toLowerCase();
			const forenameB = (b.forename || '').toLowerCase();

			return forenameA.localeCompare(forenameB);
		});

		return NextResponse.json(myFriends[0].friends, {
			headers: {
				'Cache-Control': 'no-store, max-age=0, must-revalidate',
			},
		});
	} catch (error) {
		console.error('Error fetching friends:', error);

		const errorMessage = error instanceof Error && error.message ? error.message : 'Failed to fetch friends';

		console.log('Error Message:', errorMessage);

		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
});

export { GET };
