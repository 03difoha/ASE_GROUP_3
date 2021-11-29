import pandas as pd
import numpy as np


class coordinatesToPostcodes:

    def __init__(self):
        df = pd.read_csv('ukpostcodes.csv')
        self._sorted_by_lat = df.sort_values('latitude')

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
        sorted_by_long = self._sorted_by_lat[id_min_lat:id_max_lat].sort_values(
            'longitude')

        # get all postcodes within longitude range from subset
        id_min_long, id_max_long = self._get_long_idxs(
            topleft_long, topright_long, sorted_by_long)

        return sorted_by_long[id_min_long:id_max_long]

    # longitude is east to west, increases as one goes further to the west

    def _get_long_idxs(self, topleft, topright, longsort):
        id_min = np.searchsorted(longsort['longitude'], topleft)
        id_max = np.searchsorted(longsort['longitude'], topright)

        assert id_min < id_max
        return id_min, id_max

    # latitude is north to south, increases as one goes further north
    def _get_lat_idxs(self, topleft, bottomleft, latsort):

        id_max = np.searchsorted(latsort['latitude'], topleft)
        id_min = np.searchsorted(latsort['latitude'], bottomleft)

        assert id_min < id_max
        return id_min, id_max
