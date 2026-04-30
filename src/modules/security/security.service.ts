import { 
	checkUrlSafety, 
	checkUrlSafetyBatch 
} from "../../config/google";

export async function checkUrl(url: string) {
	console.log('checkUrl', url);
	const result = await checkUrlSafety(url);
	console.log('result', result);
	return {
		...result
	};
}

export async function checkUrlBatch(urls: string[]) {
	const results = await checkUrlSafetyBatch(urls);
	return { 
		...results
	};
}
