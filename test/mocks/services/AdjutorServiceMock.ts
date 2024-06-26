import AdjutorService from "../../../src/api/services/AdjutorService";

export default class AdjutorServiceMock {

    public static getInstance( ): AdjutorService {
        return new AdjutorService( );
    }
}