import {Service, Event, FieldGroup} from '../../../shared/Workflow';

export const EventCheckTemperature: Event = {
    type: "action",
    id_node: "checkTemperature",
    name: "Check Temperature",
    description: "Check the temperature at a specific location",
    serviceName: "weather",
    fieldGroups: [
        {
            id: "locationDetails",
            name: "Location Details",
            description: "Details of the location to check",
            type: "group",
            fields: [
                {
                    id: "latitude",
                    type: "number",
                    required: true,
                    description: "Latitude of the location"
                },
                {
                    id: "longitude",
                    type: "number",
                    required: true,
                    description: "Longitude of the location"
                },
                {
                    id: "temperature",
                    type: "number",
                    required: true,
                    description: "Temperature in °C"
                }
            ]
        }
    ],
    check: async (parameters: FieldGroup[]) => {
        const locationDetails = parameters.find(p => p.id === "locationDetails");

        if (!locationDetails) {
            throw new Error("Missing 'locationDetails' in parameters.");
        }

        const latitude = locationDetails.fields.find(f => f.id === "latitude")?.value;
        const longitude = locationDetails.fields.find(f => f.id === "longitude")?.value;
        const temperatureCheck = locationDetails.fields.find(f => f.id === "temperature")?.value;

        if (latitude == null || longitude == null) {
            throw new Error("'latitude' and 'longitude' are required fields.");
        }

        try {
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
            if (!response.ok) {
                throw new Error(`Failed to fetch weather data: ${response.statusText}`);
            }
            const data = await response.json();
            const temperature = data?.current_weather?.temperature;

            console.log(`Temperature at location (${latitude}, ${longitude}): ${temperature}°C`);
            return temperature < temperatureCheck;
        } catch (error) {
            console.error('Error fetching weather data:', error.message);
            throw error;
        }
    }
};

export const EventGetWeatherForecast: Event = {
    type: "reaction",
    id_node: "getWeatherForecast",
    name: "Get Weather Forecast",
    description: "Retrieve a weather forecast for the next 24 hours",
    serviceName: "weather",
    fieldGroups: [
        {
            id: "locationDetails",
            name: "Location Details",
            description: "Details of the location for the forecast",
            type: "group",
            fields: [
                { id: "latitude", type: "number", required: true, description: "Latitude of the location" },
                { id: "longitude", type: "number", required: true, description: "Longitude of the location" },
            ],
        },
    ],
    execute: async (parameters: FieldGroup[]) => {
        const locationDetails = parameters.find(p => p.id === "locationDetails");

        if (!locationDetails) {
            throw new Error("Missing 'locationDetails' in parameters.");
        }

        const latitude = locationDetails.fields.find(f => f.id === "latitude")?.value;
        const longitude = locationDetails.fields.find(f => f.id === "longitude")?.value;

        if (latitude == null || longitude == null) {
            throw new Error("'latitude' and 'longitude' are required fields.");
        }

        try {
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m`
            );
            if (!response.ok) {
                throw new Error(`Failed to fetch weather forecast: ${response.statusText}`);
            }
            const data = await response.json();
            const forecast = data?.hourly?.temperature_2m;

            console.log(`24-hour forecast for (${latitude}, ${longitude}):`, forecast);

            return forecast;
        } catch (error) {
            console.error('Error fetching weather forecast:', error.message);
            throw error;
        }
    },
};

export const WeatherService: Service = {
    id: "weather",
    name: "Weather Service",
    description: "Service to check weather conditions",
    loginRequired: false,
    image: "https://www.svgrepo.com/show/479349/weather-symbol-1.svg",
    Event: []
};
