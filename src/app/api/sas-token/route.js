import { NextResponse } from 'next/server';
import {
	BlobSASPermissions,
	StorageSharedKeyCredential,
	generateBlobSASQueryParameters,
} from '@azure/storage-blob';

const ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const ACCOUNT_KEY = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const CONTAINER_NAME = process.env.AZURE_STORAGE_CONTAINER_NAME;
const PLUGIN_SHARED_SECRET = process.env.PLUGIN_SHARED_SECRET;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '';
const SAS_TTL_MINUTES = 5;
const BLOB_PREFIX = 'images';

function corsHeaders() {
	return {
		'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type, X-Plugin-Key',
	};
}

function sanitizeFilename(name) {
	return name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

export async function OPTIONS() {
	return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request) {
	const pluginKey = request.headers.get('x-plugin-key');
	if (!PLUGIN_SHARED_SECRET || pluginKey !== PLUGIN_SHARED_SECRET) {
		return NextResponse.json(
			{ error: 'Unauthorized' },
			{ status: 401, headers: corsHeaders() },
		);
	}

	let body;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json(
			{ error: 'Invalid JSON body' },
			{ status: 400, headers: corsHeaders() },
		);
	}

	const { spaceId, storyId, filename, contentType } = body || {};
	if (!filename) {
		return NextResponse.json(
			{ error: 'filename is required' },
			{ status: 400, headers: corsHeaders() },
		);
	}

	console.log(`SAS request — space:${spaceId} story:${storyId} file:${filename}`);

	const blobName = `${BLOB_PREFIX}/${storyId ?? 'unassigned'}/${Date.now()}-${sanitizeFilename(filename)}`;

	try {
		const credential = new StorageSharedKeyCredential(ACCOUNT_NAME, ACCOUNT_KEY);

		const startsOn = new Date(Date.now() - 60 * 1000); // small clock-skew buffer
		const expiresOn = new Date(Date.now() + SAS_TTL_MINUTES * 60 * 1000);

		const sasQueryParams = generateBlobSASQueryParameters(
			{
				containerName: CONTAINER_NAME,
				blobName,
				permissions: BlobSASPermissions.parse('cw'), // create + write, no read/delete
				startsOn,
				expiresOn,
				contentType,
			},
			credential,
		);

		const blobUrl = `https://${ACCOUNT_NAME}.blob.core.windows.net/${CONTAINER_NAME}/${blobName}`;
		const uploadUrl = `${blobUrl}?${sasQueryParams.toString()}`;

		return NextResponse.json(
			{ uploadUrl, blobUrl },
			{ status: 200, headers: corsHeaders() },
		);
	} catch (error) {
		console.error('Failed to issue SAS token', error);
		return NextResponse.json(
			{ error: 'Could not issue upload URL' },
			{ status: 500, headers: corsHeaders() },
		);
	}
}
