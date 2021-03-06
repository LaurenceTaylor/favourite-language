const FavouriteLanguage = require("../favouriteLanguage");
const axios = require("axios");
jest.mock("axios");

describe("FavouriteLanguage", () => {
  let favourite;

  beforeEach(() => {
    favourite = new FavouriteLanguage();
  });

  describe("#determine", () => {
    test("returns the favourite language in happy case", async () => {
      axios.get.mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          data: [
            { language: "Ruby" },
            { language: "Ruby" },
            { language: "JavaScript" }
          ]
        })
      );

      axios.get.mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          data: [
            { language: "JavaScript" },
            { language: "JavaScript" },
            { language: "Ruby" }
          ]
        })
      );

      expect(await favourite.determine()).toStrictEqual("Ruby");
      expect(await favourite.determine()).toStrictEqual("JavaScript");
    });

    test("returns multiple favourite languages", async () => {
      axios.get.mockImplementation(() =>
        Promise.resolve({
          status: 200,
          data: [{ language: "JavaScript" }, { language: "Ruby" }]
        })
      );

      expect(await favourite.determine()).toStrictEqual("JavaScript, Ruby");
    });

    test("returns a message when user has no code", async () => {
      axios.get.mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          data: []
        })
      );

      axios.get.mockImplementationOnce(() =>
        Promise.resolve({
          status: 200,
          data: [{ language: null }, { language: null }]
        })
      );

      for (let i = 0; i < 2; i++) {
        expect(await favourite.determine()).toStrictEqual(
          "This user has no code"
        );
      }
    });

    test("returns the favourite language when most repos are empty", async () => {
      axios.get.mockImplementation(() =>
        Promise.resolve({
          status: 200,
          data: [{ language: null }, { language: null }, { language: "Ruby" }]
        })
      );

      expect(await favourite.determine()).toStrictEqual("Ruby");
    });

    test("returns multiple favourite languages when most repos are empty", async () => {
      axios.get.mockImplementation(() =>
        Promise.resolve({
          status: 200,
          data: [
            { language: null },
            { language: null },
            { language: "Ruby" },
            { language: "JavaScript" }
          ]
        })
      );

      expect(await favourite.determine()).toStrictEqual("Ruby, JavaScript");
    });

    test("returns a message when user does not exist", async () => {
      axios.get.mockImplementation(() =>
        Promise.reject({
          response: { status: 404 }
        })
      );

      expect(await favourite.determine()).toStrictEqual(
        "<Error>: User not found"
      );
    });

    test("returns a message when something else goes wrong", async () => {
      const codes = [400, 401, 403, 405, 409, 500, 503];
      codes.forEach(code => {
        axios.get.mockImplementationOnce(() =>
          Promise.reject({
            response: { status: code }
          })
        );
      });

      for (let i = 0; i < codes.length; i++) {
        expect(await favourite.determine()).toStrictEqual(
          "<Error>: Something went wrong"
        );
      }
    });
  });
});
