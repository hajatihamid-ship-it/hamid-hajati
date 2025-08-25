// This file contains general-purpose helper functions.

export const formatPrice = (price: number): string => {
    return `${price.toLocaleString('fa-IR')} تومان`;
};

export const timeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const seconds = Math.round((new Date().getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return "همین الان";
    if (minutes < 60) return `${minutes} دقیقه پیش`;
    if (hours < 24) return `${hours} ساعت پیش`;
    return `${days} روز پیش`;
};

export const getLatestPurchase = (userData: any) => {
    if (!userData.subscriptions || userData.subscriptions.length === 0) {
        return null;
    }
    const sortedSubs = [...userData.subscriptions].sort((a: any, b: any) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
    const unfulfilled = sortedSubs.find(sub => sub.fulfilled === false);
    return unfulfilled || sortedSubs[0];
};
