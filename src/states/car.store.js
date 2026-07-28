let state = {
    nextCursor: null,
    hasMore: false,
};

export const getState = () => state;

export const setPagination = (nextCursor, hasMore) => {
    state.nextCursor = nextCursor;
    state.hasMore = hasMore;
};