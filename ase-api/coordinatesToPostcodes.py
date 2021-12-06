import csv
from bisect import bisect_left, bisect_right


class coordinatesToPostcodes:

    def __init__(self):
        with open('ukpostcodes.csv', newline='') as f:
            reader = csv.reader(f)
            headers = next(reader) 
            data = list(reader)
        
        self._sorted_by_lat = sorted(data, key = lambda x: x[1])

    def get_postcodes_in_square(self, box):
        topleft_lat = box['tl']['latitude']
        topleft_long = box['tl']['longitude']
        bottomleft_lat = box['bl']['latitude']
        topright_long = box['tr']['longitude']

        assert topleft_lat > bottomleft_lat, "topleft_lat <= bottomleft_lat"
        assert topleft_long < topright_long, "topleft_long >= topright_long"
        # get all postcodes within latitude range
        id_min_lat, id_max_lat = self._get_lat_idxs(
            topleft_lat, bottomleft_lat, self._sorted_by_lat)

        # sort subset within latitude range by longitude
        sorted_by_long = sorted(self._sorted_by_lat[id_min_lat:id_max_lat], key = lambda x: x[2], reverse=True)

        # get all postcodes within longitude range from subset
        id_min_long, id_max_long = self._get_long_idxs(
            topleft_long, topright_long, sorted_by_long)


        return self._toDictionary(sorted_by_long[id_min_long:id_max_long])

    # longitude is east to west, increases as one goes further to the west

    def _get_long_idxs(self, topleft, topright, longsort):
        
        id_min = bisect_left(self.KeyList(longsort, key=lambda x: float(x[2])), topleft)
        id_max = bisect_right(self.KeyList(longsort, key=lambda x: float(x[2])), topright)

        assert id_min < id_max
        return id_min, id_max

    # latitude is north to south, increases as one goes further north
    def _get_lat_idxs(self, topleft, bottomleft, latsort):

        id_min = bisect_left(self.KeyList(latsort, key=lambda x: float(x[1])), bottomleft)
        id_max = bisect_right(self.KeyList(latsort, key=lambda x: float(x[1])), topleft)

        assert id_min < id_max
        return id_min, id_max

    def _toDictionary(self, rows):
        d = {}
        for elem in rows:
            if elem[0] not in d:
                d[elem[0]] = {'latitude': elem[1], 'longitude' : elem[2]}
        
        return d            
                

    class KeyList(object):
        # bisect doesn't accept a key function, so we build the key into our sequence.
        def __init__(self, l, key):
            self.l = l
            self.key = key
        def __len__(self):
            return len(self.l)
        def __getitem__(self, index):
            return self.key(self.l[index])