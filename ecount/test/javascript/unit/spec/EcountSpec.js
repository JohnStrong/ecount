'use strict';

describe('Ecount Application', function() {

	/* Mock Factories */
	var mockElectionStatisticsFactory;
	var mockSharedMapServiceFactory;
	var mockGeomAPIFactory;
	var mockVisualizeFactory;

	var $controller;
	var $rootScope;
	var $httpBackend;

	beforeEach(angular.mock.module('Ecount', function($provide) {

		mockElectionStatisticsFactory = {
			getElections: jasmine.createSpy()
		};

		mockSharedMapServiceFactory = {
			draw: jasmine.createSpy()
		};

		mockGeomAPIFactory = {
			countyBounds: jasmine.createSpy(),
			electoralDivisions: jasmine.createSpy()
		};

		mockVisualizeFactory = {
			init: jasmine.createSpy(),
			firstPreferenceVotes: jasmine.createSpy(),
			percentageVote: jasmine.createSpy(),
			seats: jasmine.createSpy()
		};

		$provide.value('ElectionStatistics', mockElectionStatisticsFactory);
		$provide.value('SharedMapService', mockSharedMapServiceFactory);
		$provide.value('GeomAPI', mockGeomAPIFactory);
		$provide.value('Visualize', mockVisualizeFactory);
	}));

	beforeEach(inject(function($rootScope, $controller) {
		$controller = $controller;
		$rootScope = $rootScope;

	}));

	describe('ElectionController', function() {

		/* Constants */
		var ELECTION_CONTROLLER_GET_ELECTIONS_REQ = '/api/elections/';
		var ELECTION_CONTROLLER_MOCK_RESPONSE = [
			{'id': 1, 'title': '2011 General Election'},
			{'id': 2, 'title': '2007 General Election'}
		];

		var scope;

		beforeEach(inject(function($rootScope, $controller) {

			scope = $rootScope.$new();

			$controller('ElectionController', {
				$scope: scope
			});
		}));

		beforeEach(inject(function($injector) {
			$httpBackend = $injector.get('$httpBackend');
			$httpBackend
				.when('GET', ELECTION_CONTROLLER_GET_ELECTIONS_REQ)
				.respond([{'id': 1, 'title': '2011 General Election'}]);
		}));

		afterEach(function() {
			$httpBackend.verifyNoOutstandingExpectation();
			$httpBackend.verifyNoOutstandingRequest();
		});


		it('should contain an empty elections array', function() {
			expect(scope.elections.length).toEqual(0);
		});
	});

// udacity
// 0, 1, 1.5a and 1.5b
// journal entry - 7pm wed Jan

	describe('MapController', function() {

		var scope;

		beforeEach(inject(function($rootScope, $controller) {
			scope = $rootScope.$new();

			$controller('MapController', {
				$scope: scope,
				$route: {},
				$routeParams: {}
			});

		}));
	});

	describe('CountyController', function() {

		var scope;

		var ROUTE_PARAMS_COUNTY_ID = 12;
		var ROUTE_PARAMS_ELECTION_ID = 2;

		beforeEach(inject(function($rootScope, $controller){
			scope = $rootScope.$new();

			$controller('CountyController', {
				$scope: scope,
				$routeParams: {
					'cid': ROUTE_PARAMS_COUNTY_ID,
					'eid': ROUTE_PARAMS_ELECTION_ID
				}
			});
		}));

		it("should have null values for both countyId and electionId", function() {
			expect(scope.countyId).toBe(null);
			expect(scope.electionId).toBe(null);
		});

		it("should set countyId and electionId to its corresponding routeParams values on init ", function() {
			scope.init();

			expect(scope.countyId).toBe(ROUTE_PARAMS_COUNTY_ID);
			expect(scope.electionId).toBe(ROUTE_PARAMS_ELECTION_ID);
		});
	});

	describe('VisualizationController', function() {

		var VISUALIZE_CONSTITUENCY_STATS = {
			title: 'Galway-East',
			stats: []
		};

		var scope;

		beforeEach(inject(function($rootScope, $controller){
			scope = $rootScope.$new();
			scope.c = VISUALIZE_CONSTITUENCY_STATS;

			$controller('VisualizationController', {
				$scope: scope,
				$element: {},
				Visualize: mockVisualizeFactory
			});
		}));

		it("should call visualize factory methods on compile", function() {
			expect(mockVisualizeFactory.init).toHaveBeenCalled();
		});
	});
});
