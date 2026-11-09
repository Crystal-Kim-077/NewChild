import { useEffect, useState } from 'react';

const EMPTY = { total: 0, rows: [] };

/**
 * 페이지 단위 목록을 불러온다. fetcher가 바뀌면 이전 데이터를 보여주지 않는다.
 *
 * @param {function} fetcher - (page) => Promise<{ total, rows, ... }> 형태의 고정된 함수
 */
export const usePagedList = (fetcher) => {
  const [page, setPage] = useState(1);
  const [loaded, setLoaded] = useState({ fetcher: null, data: EMPTY, error: '' });

  useEffect(() => {
    let isActive = true;
    fetcher(page)
      .then((data) => {
        if (isActive) setLoaded({ fetcher, data, error: '' });
      })
      .catch((requestError) => {
        if (isActive) setLoaded({ fetcher, data: EMPTY, error: requestError.message });
      });
    return () => {
      isActive = false;
    };
  }, [fetcher, page]);

  const isCurrent = loaded.fetcher === fetcher;
  return { page, setPage, data: isCurrent ? loaded.data : EMPTY, error: isCurrent ? loaded.error : '' };
};
