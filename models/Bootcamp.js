const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/goeCoder');

const Schema = mongoose.Schema;

const bootcampSchema = new Schema({
	name: {
		type: String,
		required: [ true, 'Please add a name' ],
		unique: true,
		trim: true,
		maxlength: [ 50, 'Name cannot be more than 50 characters' ]
	},
	slug: String,
	description: {
		type: String,
		required: [ true, 'Please add a description' ],
		maxlength: [ 500, 'Description cannot be more than 500 characters' ]
	},
	website: {
		type: String,
		match: [
			/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
			'Please use a valid URL with HTTP or HTTPS'
		]
	},
	phone: {
		type: String,
		maxlength: [ 20, 'Phone number cannot be more than 20 characters' ]
	},
	email: {
		type: String,
		match: [ /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email' ]
	},
	address: {
		type: String,
		required: [ true, 'Please add an address' ]
	},
	location: {
		// GeoJSON Point
		type: {
			type: String,
			enum: [ 'Point' ] // 'location.type' must be 'Point'
			// required: true
		},
		coordinates: {
			type: [ Number ],
			// required: true,
			index: '2dsphere'
		},
		formattedAddress: String,
		street: String,
		city: String,
		state: String,
		zipcode: String,
		country: String
	},
	careers: {
		// Array of strings
		type: [ String ],
		required: true,
		enum: [ 'Web Development', 'Mobile Development', 'UI/UX', 'Data Science', 'Business', 'Other' ]
	},
	averageRating: {
		type: Number,
		min: [ 1, 'Rating must be at least 1' ],
		max: [ 10, 'Rating cannot be more than 10' ]
	},
	averageCost: Number,
	photo: {
		type: String,
		default: 'no-photo.jpg'
	},
	housing: {
		type: Boolean,
		default: false
	},
	jobAssistance: {
		type: Boolean,
		default: false
	},
	jobGuarantee: {
		type: Boolean,
		default: false
	},
	acceptGi: {
		type: Boolean,
		default: false
	},
	createdAt: {
		type: Date,
		default: Date.now
	}
});

// Create bootcamp slug from the name
bootcampSchema.pre('save', function(next) {
	this.slug = slugify(this.name, {lower: true});
	next();
});

// Geocode & create location field
bootcampSchema.pre('save', async function(next) {
	const loc = await geocoder.geocode(this.address); // this returns an array of object
	const {
		latitude,
		longitude,
		countryCode,
		city,
		zipcode,
		streetName,
		stateCode,
		formattedAddress
	} = loc[0];

	// Set location
	this.location = {
		type: 'Point',
		coordinates: [longitude, latitude],
		formattedAddress,
		street: streetName,
		city,
		state: stateCode,
		zipcode,
		country: countryCode
	};

	// Do not save address in DB
	this.address = undefined;
	next();
});

const BootcampSchema = mongoose.model('Bootcamp', bootcampSchema);

module.exports = BootcampSchema;
