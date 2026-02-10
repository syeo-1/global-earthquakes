'''
responsible for gathering the coordinate data used in the map regarding earthquake data

will focus on gathering data for only 2.5 magnitude+ earthquakes from as far back as 30 days

data will be retrieved from earthquake.usgs.gov

start here: https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
the links on the right side lead directly to the REST endpoint, so just
choose whichever one you want. I've decided to use All Earthquakes endpoint
for the past 30 days

All earthqquakes REST endpoint for last 30 days: https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson
'''
import json, requests, sys

from plotly.graph_objs import Scattergeo, Layout
from plotly import offline

def retrieve_earthquake_feature_data_from_api():
    '''
    retrieves earthquake feature data from the usgs earthquake api

    feature data includes two important properties for further processing:

    properties:
    - magnitude value
    - place
    - time (in epoch seconds)
    - updated (in epoch seconds)

    geometry:
    - coordinate point for where the earthquake occured
    '''

    data = requests.get('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson')

    if data.status_code == 200:
        usgs_earthquake_data = json.loads(data.text)
        return usgs_earthquake_data['features']
    else:
        print('error in retrieving data')
        exit(1)


def process_earthquake_data(earthquake_data):
    '''
    :earthquake_data: contains all feature data from the last 30 days regarding
    global earthquake data from usgs

    This function will extract magnitude, time occured, longitude, and lattitude data for earthquakes
    in order for the data to be displayed to a map later.

    The data will be grouped together as a list of dictionaries in the following format:

    [
        {
            magnitude: 4.5,
            time_occured: 1770071929530,
            place: '7 km NNW of Meadow Lakes, Alaska
            lattitude: 103.12
            longitude: 24.32
        },
        ...
        ...
    ]
    '''

    processed_earthquake_data = []

    for feature_data in earthquake_data:
        processed_feature_data = {
            'magnitude': feature_data['properties']['mag'],
            'time_occured': feature_data['properties']['time'],
            'place': feature_data['properties']['place'],
            'longitude': feature_data['geometry']['coordinates'][0],
            'lattitude': feature_data['geometry']['coordinates'][1]
        }
        processed_earthquake_data.append(processed_feature_data)

    return processed_earthquake_data

def process_earthquake_data_plotly(processed_earthquake_data):
    '''
    process earthquake data for the data in order
    to more cleanly place it onto the map in plotly
    '''

    magnitudes = []
    longitudes = []
    lattitudes = []

    for feature_data in processed_earthquake_data:
        magnitudes.append(feature_data['magnitude'])
        longitudes.append(feature_data['longitude'])
        lattitudes.append(feature_data['lattitude'])


    return {
        'magnitudes': magnitudes,
        'longitudes': longitudes,
        'lattitudes': lattitudes
    }

def process_earthquake_data_leaflet(processed_earthquake_data):
    '''
    process earthquake data for the data in order to be displayed
    for the leaflet map
    '''
    magnitudes = []
    time_occured = []
    places = []
    longitudes = []
    lattitudes = []

    for feature_data in processed_earthquake_data:
        # print(feature_data.keys())
        magnitudes.append(feature_data['magnitude'])
        time_occured.append(feature_data['time_occured'])
        places.append(feature_data['place'])
        longitudes.append(feature_data['longitude'])
        lattitudes.append(feature_data['lattitude'])


    return {
        'magnitudes': magnitudes,
        'times_occured': time_occured,
        'places': places,
        'longitudes': longitudes,
        'lattitudes': lattitudes
    }

def graph_earthquake_data(earthquake_data):
    '''
    graph out the earthquake data onto a plotly map
    '''
    data = [Scattergeo(lon=earthquake_data['longitudes'], lat=earthquake_data['lattitudes'])]
    layout = Layout(title='Global Earthquakes')

    figure = {
        'data': data,
        'layout': layout
    }
    offline.plot(figure, filename='global_earthquakes.html')

def output_data_for_leaflet(leaflet_data):
    sys.stdout.buffer.write('magnitude|longitude|lattitude|time|place\n'.encode('utf-8'))

    for data in zip(
        leaflet_data['magnitudes'],
        leaflet_data['longitudes'],
        leaflet_data['lattitudes'],
        leaflet_data['times_occured'],
        leaflet_data['places'],
    ):
        sys.stdout.buffer.write(f'{data[0]}|{data[1]}|{data[2]}|{data[3]}|{data[4]}\n'.encode('utf-8'))



def main():
    earthquake_feature_data = retrieve_earthquake_feature_data_from_api()
    processed_earthquake_data = process_earthquake_data(earthquake_feature_data)
    leaflet_processed_earthquake_data = process_earthquake_data_leaflet(processed_earthquake_data)
    output_data_for_leaflet(leaflet_processed_earthquake_data)

    # print(processed_earthquake_data)
    # plotly_graph_data = process_earthquake_data_plotly(processed_earthquake_data)
    
    # adhoc data printout for csv
    # print('magnitude,longitude,lattitude')
    # for data in zip(
    #     plotly_graph_data['magnitudes'],
    #     plotly_graph_data['longitudes'],
    #     plotly_graph_data['lattitudes'],
    # ):
    #     print(f'{data[0]},{data[1]},{data[2]}')

    # graph_earthquake_data(plotly_graph_data)


if __name__ == '__main__':
    main()