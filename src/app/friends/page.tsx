'use client';

import React, {useState, useEffect} from 'react';
import Loading from '@/app/home/loading';
import styles from './styles.module.scss';
import {baseApiUrl} from '@/app/constants';
import {Person} from '@/app/types';
import Link from 'next/link';

type ErrorResponse = {
	error: string;
};

export default function Home() {
	const [friends, setFriends] = useState<Person[]>([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(25);

	useEffect(() => {
		(async () => {
			try {
				const res = await fetch(`${baseApiUrl}/api/people/getFriends`, {
					method: 'GET'
				});

				if (!res.ok) {
					throw new Error(`HTTP error! Status: ${res.status}`);
				}

				const data = await res.json() as Person[];
				setFriends(data);
			} catch (error) {
				console.error('Error fetching friends:', error);
				const errorMessage = error instanceof Error && error.message ? error.message : 'Failed to fetch friends';
				const errorResponse: ErrorResponse = {error: errorMessage};

				return errorResponse;
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = friends ? friends.slice(indexOfFirstItem, indexOfLastItem) : [];

	const paginate = (pageNumber: number) => {
		setCurrentPage(pageNumber);
		window.scrollTo({top: 0});
	};

	return (
		<>
			<section className={styles.outerContainer}>
				<Link href={'/home'}>
					<button className="primaryButton mt-5">People</button>
				</Link>
				<h1 className={styles.pageHeading}>My Friends</h1>
				{loading && <Loading />}
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
							</section>

						))}
					</section>
				)}
				{friends && friends.length > itemsPerPage && (
					<ul className={styles.pagination}>
						{Array.from({length: Math.ceil(friends.length / itemsPerPage)}).map((_, index) => (
							<li key={index}>
								<button onClick={() => paginate(index + 1)} className={currentPage == index + 1 ? styles.active : ''}>
									{index + 1}
								</button>
							</li>
						))}
					</ul>
				)}
			</section>
		</>
	);
}
