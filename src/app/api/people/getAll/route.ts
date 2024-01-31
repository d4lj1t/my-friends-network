import { NextResponse } from 'next/server';
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import connectToMongoDb from '@/app/libs/mongodb';
import PeopleModel from '@/app/models/people';
import { Person } from '@/app/types';

const GET = withApiAuthRequired(async () => {
	try {
		await connectToMongoDb();

		const session = await getSession();

		if (!session?.accessToken || !session.user) {
			return NextResponse.json({ error: 'Invalid or missing access token or user in the session' }, { status: 401 });
		}

		const userId = session.user.sub as string;

		const existingUser = await PeopleModel.findOne({ "people.id": userId }) as Person;

		if (!existingUser) {
			await PeopleModel.updateOne(
				{},
				{
					$push: {
						people: {
							id: userId,
							forename: session.user.given_name as string,
							surname: session.user.family_name as string,
						}
					}
				},
				{ upsert: true }
			);
		}

		const data = await PeopleModel.find({}).lean();

		const allPeople = data.flatMap(entry => entry.people) as Person[];

		allPeople.sort((a, b) => {
			const forenameA = (a.forename || '').toLowerCase();
			const forenameB = (b.forename || '').toLowerCase();

			return forenameA.localeCompare(forenameB);
		});

		const responsePayload = {
			userId,
			people: allPeople,
		};

		return NextResponse.json(responsePayload, {
			headers: {
				'Cache-Control': 'no-store, max-age=0, must-revalidate',
			},
		});
	} catch (error) {
		console.error('Error fetching people:', error);

		const errorMessage = error instanceof Error && error.message ? error.message : 'Failed to fetch people';

		console.log('Error Message:', errorMessage);

		return NextResponse.json({ error: errorMessage }, { status: 500 });
	}
});

export { GET };
