/**
 * Generates a Shopee Affiliate link following the official guidelines.
 * 
 * Pattern: https://s.shopee.co.id/an_redir?origin_link={encoded_url}&affiliate_id={id}&sub_id={sub_id}
 * 
 * @param url The original Shopee product URL
 * @param affiliateId The user's Shopee Affiliate ID
 * @param subId Optional sub-id (e.g. "affiliate-hub")
 */
export function generateShopeeAffiliateLink(url: string, affiliateId: string | null, subId: string = 'affiliate-hub'): string {
    if (!affiliateId) return url;
    
    // Step 1 & 2: Get and Encode the URL
    // We clean the URL first to remove tracking params from others if any
    const cleanUrl = url.split('?')[0];
    const encodedUrl = encodeURIComponent(cleanUrl);
    
    // Steps 3 & 4: Append Prefix and Parameters
    return `https://s.shopee.co.id/an_redir?origin_link=${encodedUrl}&affiliate_id=${affiliateId}&sub_id=${subId}`;
}
