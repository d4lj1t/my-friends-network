import mongoose, { Schema } from 'mongoose';

const peopleModelSchema = new Schema(
	{
		people: [
			{
				id: String,
				forename: String,
				surname: String,
				dob: String,
				ssn: String,
				issuedDateAndTime: String,
				friends: [
					{
						type: String,
					},
				],
				image: String,
				primaryLocation: {
					type: { type: String },
					coordinates: [Number, Number],
				},
			},
		],
	},
	{
		timestamps: true,
	}
);

const PeopleModel = mongoose.models.PeopleModel || mongoose.model('PeopleModel', peopleModelSchema, 'people');

export default PeopleModel;
