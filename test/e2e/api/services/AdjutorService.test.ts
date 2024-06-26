import axios from "axios";

import AdjutorService from "../../../../src/api/services/AdjutorService";
import { env } from "../../../../src/env";
import AdjutorServiceMock from "../../../mocks/services/AdjutorServiceMock";

const adjutorConfig = env.lendsqr.adjutor;

jest.mock("axios");

describe("AdjutorService", () => {
    let adjutorService: AdjutorService;

    beforeAll(()=>{
        adjutorService = AdjutorServiceMock.getInstance();
    });

    beforeEach(() => {

    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getResource", () => {
        it("should fetch a resource successfully", async () => {
            const path = "users";
            const expectedResponse = {
                data: [{ id: 1, name: "John Doe" }],
                status: 200,
                statusText: "OK",
            };

            (axios.get as jest.Mock).mockResolvedValueOnce({ data: expectedResponse.data, status: expectedResponse.status, statusText: expectedResponse.statusText });

            const response = await adjutorService.getResource(path);
            expect(axios.get).toHaveBeenCalledWith(`${adjutorConfig.baseUrl}${path}`, { headers: { Authorization: `Bearer ${adjutorConfig.apiKey}` } });
            expect(response).toEqual(expectedResponse);
        });

        it("should throw an error when fetching a resource fails", async () => {
            const path = "users";

            (axios.get as jest.Mock).mockRejectedValueOnce({ response: { status: 404, statusText: "Not Found" } });

            await expect(adjutorService.getResource(path)).rejects.toThrow("An unexpected error occurred while fetching the resource");
        });

        it("should throw a generic error when an unexpected error occurs", async () => {
            const path = "users";
            const errorMessage = "Unexpected error";

            (axios.get as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

            await expect(adjutorService.getResource(path)).rejects.toThrow("An unexpected error occurred while fetching the resource");
        });
    });

    describe("postResource", () => {
        it("should post a resource successfully", async () => {
            const path = "users";
            const data = { name: "John Doe", email: "john@example.com" };
            const expectedResponse = {
                data: { id: 1, name: "John Doe", email: "john@example.com" },
                status: 201,
                statusText: "Created",
            };

            (axios.post as jest.Mock).mockResolvedValueOnce({ data: expectedResponse.data, status: expectedResponse.status, statusText: expectedResponse.statusText });

            const response = await adjutorService.postResource(path, data);
            expect(axios.post).toHaveBeenCalledWith(`${adjutorConfig.baseUrl}${path}`, data, { headers: { Authorization: `Bearer ${adjutorConfig.apiKey}` } });
            expect(response).toEqual(expectedResponse);
        });

        it("should throw an error when posting a resource fails", async () => {
            const path = "users";
            const data = { name: "John Doe", email: "john@example.com" };

            (axios.post as jest.Mock).mockRejectedValueOnce({ response: { status: 400, statusText: "Bad Request" } });

            await expect(adjutorService.postResource(path, data)).rejects.toThrow("An unexpected error occurred while posting the resource");
        });

        it("should throw a generic error when an unexpected error occurs", async () => {
            const path = "users";
            const data = { name: "John Doe", email: "john@example.com" };
            const errorMessage = "Unexpected error";

            (axios.post as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

            await expect(adjutorService.postResource(path, data)).rejects.toThrow("An unexpected error occurred while posting the resource");
        });
    });
});
