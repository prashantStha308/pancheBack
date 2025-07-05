import { body, query , param } from 'express-validator';

// Sanitize body
export const sanitizeAndValidatePlaylistBody = [
    body('name').trim().escape().isLength({ min: 1, max: 50 }),
    body('visibility').trim().escape().isIn(['public', 'private', 'unlisted']),
    body('trackList').isArray().notEmpty(),
    body('type').trim().escape().isIn(['singles','ep','album','playlist']).withMessage('body.type must be one of: singles, ep, album, playlist'),
]

export const sanitizeAndValidateTrackBody = [
    body('name').trim().escape().isLength({ min: 1, max: 50 }),
    body('visibility').trim().escape().isIn(['public', 'private', 'unlisted']),
]

export const sanitizeAndValidateUserBody = [
    body('email').isEmail().normalizeEmail(),
    body('username').trim().escape().isLength({ min: 1, max: 50 }),
    body('fullName').trim().escape().isLength({ min: 1, max: 50 }),
    body('password').isLength({ min: 8, max: 50 }),
    body('role').escape(),
    body('location').isJSON().optional(),
];

// Sanitize Query
export const sanitizeBasicQuery = [
    query('page').isInt({min: 1}).optional(),
    query('limit').isInt({ min: 1, max: 100 }).optional(),
    query('search').escape().optional(),
]

export const sanitizeUserQuery = [
    ...sanitizeBasicQuery,
    query('city').trim().escape().optional(),
    query('country').trim().escape().optional(),
]

export const sanitizeTrackQuery = [
    ...sanitizeBasicQuery,
    query('artist').escape().optional(),
    query('sort').isIn(["playCount", "durationPlayed", "-playCount", "-durationPlayed"]),
]

export const sanitizePlaylistQuery = [
    ...sanitizeBasicQuery,
]

// Params
const sanitizeParam = (selectedParam) => {
    return param(selectedParam).isMongoId().withMessage( selectedParam + ' must be a valid MongoDB ObjectId');
}

export const sanitizeUserParams = [
    sanitizeParam('userId')
]

export const sanitizeTrackParams = [
    sanitizeParam('trackId')
]

export const sanitizePlaylistParams = [
    sanitizeParam('playlistId')
]

export const sanitizeFollowingParams = [
    sanitizeParam('receiverId')
]