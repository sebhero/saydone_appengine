package com.boreback.saydone.entity;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiNamespace;
import com.google.api.server.spi.response.CollectionResponse;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.datanucleus.query.JDOCursorHelper;

import javax.annotation.Nullable;
import javax.inject.Named;
import javax.jdo.PersistenceManager;
import javax.jdo.Query;
import javax.persistence.EntityExistsException;
import javax.persistence.EntityNotFoundException;
import java.util.HashMap;
import java.util.List;

@Api(name = "testtaskendpoint", namespace = @ApiNamespace(ownerDomain = "boreback.com", ownerName = "boreback.com", packagePath = "saydone.entity"))
public class TestTaskEndpoint {

	/**
	 * This method lists all the entities inserted in datastore.
	 * It uses HTTP GET method and paging support.
	 *
	 * @return A CollectionResponse class containing the list of all entities
	 * persisted and a cursor to the next page.
	 */
	@SuppressWarnings({ "unchecked", "unused" })
	@ApiMethod(name = "listTestTask")
	public CollectionResponse<TestTask> listTestTask(
			@Nullable @Named("cursor") String cursorString,
			@Nullable @Named("limit") Integer limit) {

		PersistenceManager mgr = null;
		Cursor cursor = null;
		List<TestTask> execute = null;

		try {
			mgr = getPersistenceManager();
			Query query = mgr.newQuery(TestTask.class);
			if (cursorString != null && cursorString != "") {
				cursor = Cursor.fromWebSafeString(cursorString);
				HashMap<String, Object> extensionMap = new HashMap<String, Object>();
				extensionMap.put(JDOCursorHelper.CURSOR_EXTENSION, cursor);
				query.setExtensions(extensionMap);
			}

			if (limit != null) {
				query.setRange(0, limit);
			}

			execute = (List<TestTask>) query.execute();
			cursor = JDOCursorHelper.getCursor(execute);
			if (cursor != null)
				cursorString = cursor.toWebSafeString();

			// Tight loop for fetching all entities from datastore and accomodate
			// for lazy fetch.
			for (TestTask obj : execute)
				;
		} finally {
			mgr.close();
		}

		return CollectionResponse.<TestTask> builder().setItems(execute)
				.setNextPageToken(cursorString).build();
	}

	/**
	 * This method gets the entity having primary key id. It uses HTTP GET method.
	 *
	 * @param id the primary key of the java bean.
	 * @return The entity with primary key id.
	 */
	@ApiMethod(name = "getTestTask")
	public TestTask getTestTask(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		TestTask testtask = null;
		try {
			testtask = mgr.getObjectById(TestTask.class, id);
		} finally {
			mgr.close();
		}
		return testtask;
	}

	/**
	 * This inserts a new entity into App Engine datastore. If the entity already
	 * exists in the datastore, an exception is thrown.
	 * It uses HTTP POST method.
	 *
	 * @param testtask the entity to be inserted.
	 * @return The inserted entity.
	 */
	@ApiMethod(name = "insertTestTask")
	public TestTask insertTestTask(TestTask testtask) {
		PersistenceManager mgr = getPersistenceManager();

		try {

            //So that its checks first if its a new object with no id
            //Then create it.
            if(testtask.getId() != null){
                if (containsTestTask(testtask)) {
                    throw new EntityExistsException("Object already exists");
                }
            }
			mgr.makePersistent(testtask);
		} finally {
			mgr.close();
		}
		return testtask;
	}

	/**
	 * This method is used for updating an existing entity. If the entity does not
	 * exist in the datastore, an exception is thrown.
	 * It uses HTTP PUT method.
	 *
	 * @param testtask the entity to be updated.
	 * @return The updated entity.
	 */
	@ApiMethod(name = "updateTestTask")
	public TestTask updateTestTask(TestTask testtask) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			if (!containsTestTask(testtask)) {
				throw new EntityNotFoundException("Object does not exist");
			}
			mgr.makePersistent(testtask);
		} finally {
			mgr.close();
		}
		return testtask;
	}

	/**
	 * This method removes the entity with primary key id.
	 * It uses HTTP DELETE method.
	 *
	 * @param id the primary key of the entity to be deleted.
	 */
	@ApiMethod(name = "removeTestTask")
	public void removeTestTask(@Named("id") Long id) {
		PersistenceManager mgr = getPersistenceManager();
		try {
			TestTask testtask = mgr.getObjectById(TestTask.class, id);
			mgr.deletePersistent(testtask);
		} finally {
			mgr.close();
		}
	}


	private boolean containsTestTask(TestTask testtask) {
		PersistenceManager mgr = getPersistenceManager();
		boolean contains = true;
		try {
			mgr.getObjectById(TestTask.class, testtask.getId());
		} catch (javax.jdo.JDOObjectNotFoundException ex) {
			contains = false;
		} finally {
			mgr.close();
		}
		return contains;
	}




	private static PersistenceManager getPersistenceManager() {
		return PMF.get().getPersistenceManager();
	}

}
