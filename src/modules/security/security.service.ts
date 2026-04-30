import { 
	checkUrlSafety, 
	checkUrlSafetyBatch 
} from "../../config/google";

export async function checkUrl(url: string) {
	const result = await checkUrlSafety(url);
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
