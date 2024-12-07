import { Service, Event, FieldGroup } from '../../../shared/Workflow';

export const EventCheckFreezingTemperature: Event = {
    type: "Action",
    id: "checkFreezingTemperature",
    name: "Check Freezing Temperature",
    description: "Check if the temperature is below 0°C using Open-Meteo",
    parameters: [
        {
            id: "locationDetails",
            name: "Location Details",
            description: "Details of the location to check",
            type: "group",
            fields: [
                { id: "latitude", type: "number", required: true, description: "Latitude of the location" },
                { id: "longitude", type: "number", required: true, description: "Longitude of the location" }
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
            return temperature < 0;
        } catch (error) {
            console.error('Error fetching weather data:', error.message);
            throw error;
        }
    }
};

export const TestService: Service = {
    id: "testService",
    name: "Test Service",
    description: "A service for testing purposes",
    loginRequired: false,
    Event: []
};
