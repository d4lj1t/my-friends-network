'use client';

import React, {useState, useEffect} from 'react';
import Link from 'next/link';
import Loading from '@/app/home/loading';
import styles from '@/app/styles/friends.module.scss';
import {baseApiUrl} from '@/app/constants';
import {Person, PeopleData} from '@/app/types';
import {addFriend} from '@/services/addFriend';
import NetworkGraph from '@/app/components/NetworkGraph';

type ErrorResponse = {
	error: string;
};

export default function Home() {
	const [people, setPeople] = useState<Array<Person> | null>(null);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(25);
	const [addedFriends, setAddedFriends] = useState<string[]>([]);
	const [showCurrentItems, setShowCurrentItems] = useState(true);
	const [userId, setUserId] = useState<string | undefined>();

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch(`${baseApiUrl}/api/people/getAll`, {
					method: 'GET'
				});

				if (!res.ok) {
					throw new Error(`HTTP error! Status: ${res.status}`);
				}

				const data: { userId: string; people: Person[]; } = await res.json() as PeopleData;
				setPeople(data.people);
				setUserId(data.userId);

				const userObject = data?.people.find(f => f.id === data.userId);

				const userFriends = userObject?.friends || [];

				setAddedFriends(userFriends);

			} catch (error) {
				console.error('Error fetching people:', error);
				const errorMessage = error instanceof Error && error.message ? error.message : 'Failed to fetch people';
				const errorResponse: ErrorResponse = {error: errorMessage};

				return errorResponse;
			} finally {
				setLoading(false);
			}
		})();
	}, [setAddedFriends]);

	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const filteredPeople = people?.filter(person => person.id !== userId);
	const currentItems = filteredPeople ? filteredPeople.slice(indexOfFirstItem, indexOfLastItem) : [];

	const paginate = (pageNumber: number) => {
		setCurrentPage(pageNumber);
		window.scrollTo({top: 0});
	};

	const addFriendHandler = async (friendId: string) => {
		try {
			await addFriend(friendId as string);
			setAddedFriends((prevAddedFriends) => [...prevAddedFriends, friendId]);
		} catch (error) {
			console.log(`Failed to add friend ${friendId}`);
		}
	}

	const toggleCurrentItems = () => {
		setShowCurrentItems(!showCurrentItems);
	};

	return (
		<>
			<section className={styles.outerContainer}>
				<Link href={'/friends'}>
					<button className="primaryButton mt-5"> My Friends</button>
				</Link>
				<button onClick={toggleCurrentItems} className="primaryButton ml-5">
					{showCurrentItems ? 'My Network Chart' : 'People'}
				</button>
				<h1 className={styles.pageHeading}>{!showCurrentItems ? 'My Network Chart' : 'People'}</h1>
				{loading && <Loading />}
				{showCurrentItems && (
					<section>
						{currentItems && currentItems.length > 0 && (
							<section className={styles.cardsContainer}>
								{currentItems.map((person, index) => (
									<section className={styles.personCard} key={index}>
										<section>
											<div>Name</div>
											<div>{String(person.forename)} {String(person.surname)}</div>
										</section>
										<section>
											<div>Date of birth</div>
											<div>{new Date(person.dob).toLocaleDateString('en-GB')}</div>
										</section>
										{!addedFriends?.includes(person.id) && (
											<section>
												<button onClick={() => addFriendHandler(person.id)} className="primaryButton">Add
													Friend
												</button>
											</section>
										)}
										<section>
											<div>Friends</div>
											{person.friends.length && (
												<div className={styles.friendsContainer}>
													{person.friends.map((friendId, index) => {
														const friendObject = people?.find(f => f.id === friendId);
														if (friendObject) {
															return (
																<section className={styles.friendCard} key={index}>
																	<section>
																		<div>Name</div>
																		<div>{String(friendObject.forename)} {String(friendObject.surname)}</div>
																	</section>
																	<section>
																		<div>Date of birth</div>
																		<div>{new Date(friendObject.dob).toLocaleDateString('en-GB')}</div>
																	</section>
																	{!addedFriends.includes(friendObject.id) && (
																		<section>
																			<button onClick={() => addFriendHandler(friendObject.id)}
																					  className="primaryButton">Add Friend
																			</button>
																		</section>
																	)}
																</section>
															);
														}
													})}
												</div>
											)}
											{!person.friends.length && (
												<div>No friends</div>
											)}
										</section>
									</section>
								))}
							</section>
						)}
						{people && people.length > itemsPerPage && (
							<ul className={styles.pagination}>
								{Array.from({length: Math.ceil(people.length / itemsPerPage)}).map((_, index) => (
									<li key={index}>
										<button onClick={() => paginate(index + 1)}
												  className={currentPage == index + 1 ? styles.active : ''}>
											{index + 1}
										</button>
									</li>
								))}
							</ul>
						)}
					</section>
				)}
				{!showCurrentItems && people && userId && (
					<NetworkGraph data={people} myUserId={userId} />
				)}
			</section>
		</>
	);
}
